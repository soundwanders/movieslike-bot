const axios = require('axios');
const { getMovieCredits } = require('./getMovieCredits');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Find similar movies based on shared genres and additional query parameters if present
const findSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatch) => {
  try {
    // Calculate range based on the release date of the query movie
    const releaseYear = new Date(releaseDate).getFullYear();
    const minReleaseYear = releaseYear - 40;
    const maxReleaseYear = releaseYear + 40;

    // Extract the actor name from the actorMatches array
    const actorName = actorMatches ? actorMatches[0].replace('--actor=', '').trim() : '';

    // Fetch movie data using axios with query parameters
    // Add genre, actor, language, and release year range query params if available
    const queryParams = {
      api_key: TMDB_API_KEY,
      ...(genreMatches && { with_genres: genreMatches.map((genre) => genre.trim()).join(',') }),
      ...(actorMatches && { with_cast: actorMatches.map((actor) => actor.trim()).join(',') }),
      ...(languageMatch && { with_original_language: languageMatch[1] }),
      'primary_release_date.gte': `${minReleaseYear}-01-01`,
      'primary_release_date.lte': `${maxReleaseYear}-12-31`,
    };

    const { data } = await axios.get(`${TMDB_API_URL}/discover/movie`, {
      api_key: TMDB_API_KEY,
      params: queryParams,
    });

    let similarMovies = data.results;

    // Calculate similarity score for each similar movie based on multiple factors
    similarMovies = similarMovies.map((movie) => {
      // Calculate shared genres
      const sharedGenres = movie.genre_ids.filter((genreId) => queryMovie.genre_ids.includes(genreId));
      movie.sharedGenres = sharedGenres.length;

      // Calculate shared actors
      if (actorMatches) {
        movie.sharedActors = movie.cast.filter((cast) => {
          const actorNameLower = actorName.toLowerCase();
          return cast.name.toLowerCase() === actorNameLower;
        }).length;
      } else {
        movie.sharedActors = 0;
      }

      // Add other similarity factors as needed, e.g. shared directors, keywords, etc.

      // Calculate similarity score
      movie.similarityScore = movie.sharedGenres + movie.sharedActors; // Add other factors as needed
      return movie;
    });

    // Sort movies based on similarity score in descending order
    similarMovies.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filter movies based on language
    if (languageMatch) {
      similarMovies = similarMovies.filter((movie) => {
        return movie.original_language.toLowerCase() === languageMatch[1].toLowerCase();
      });
    }

    // Filter out the query movie from the API results
    similarMovies = similarMovies.filter((movie) => movie.id !== queryMovie.id);

    if (similarMovies.length === 0) {
      return null;
    } else {
      // Limit the number of similar movies to 40
      similarMovies = similarMovies.slice(0, 40);

      // Fetch movie credits for each movie and filter based on actor's name
      if (actorMatches) {
        const similarMovieCredits = await Promise.all(
          similarMovies.map(async (movie) => {
            const movieCredits = await getMovieCredits(movie.id); // Get movie credits
            movie.cast = movieCredits.cast; // Add cast data to movie object
            return movie;
          })
        );

        similarMovies = similarMovieCredits.filter((movie) => {
          const movieCast = movie.cast.map((cast) => cast.name.toLowerCase());
          const actorNameLower = actorName.toLowerCase();
          return movieCast.includes(actorNameLower);
        });
      }

      // Sort movies based on popularity in descending order
      similarMovies.sort((a, b) => b.popularity - a.popularity);

      // Return the sorted and filtered list of similar movies
      return similarMovies;
    }
  } catch (error) {
    // Catch any errors that occur during the API call
    console.error('Error finding similar movies:', error);
    throw new Error('Sorry! Failed to find any similar movies. Please try another search.');
  }
};

module.exports = {
  findSimilarMovies,
};
