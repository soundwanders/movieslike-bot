const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Find similar movies based on shared genres and additional query parameters if present
const findSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatch) => {
  try {
    // Calculate range based on the release date of the query movie
    const currentYear = new Date().getFullYear();
    const releaseYear = new Date(releaseDate).getFullYear();
    const minReleaseYear = releaseYear - 40;
    const maxReleaseYear = releaseYear + 40;

    // Extract the actor name from the actorMatches array
    const actorName = actorMatches ? actorMatches[0].replace('--actor=', '').trim() : '';

    // Fetch movie data using axios with query parameters
    // Add genre, actor, language, and release year range query params if available
    const queryParams = {
      api_key: TMDB_API_KEY,
      with_genres: genreMatches ? genreMatches.map((genre) => genre.trim()).join(',') : '',
      with_cast: actorName,
      with_original_language: languageMatch ? languageMatch[1] : '',
      'primary_release_date.gte': `${minReleaseYear}-01-01`,
      'primary_release_date.lte': `${maxReleaseYear}-12-31`,
    };
    
    const { data } = await axios.get(`${TMDB_API_URL}/discover/movie`, {
      api_key: TMDB_API_KEY,
      params: queryParams,
    });
    
    let similarMovies = data.results;
    
    // Filter movies based on genre, actor, language
    if (genreMatches) {
      similarMovies = similarMovies.filter((movie) => {
        const movieGenres = movie.genre_ids.map((genreId) => genreId.toString());
        return genreMatches.some((genre) => movieGenres.includes(genre));
      });
    }

    if (actorMatches) {
      similarMovies = similarMovies.filter((movie) => {
        const movieCast = movie.cast.map((cast) => cast.name.toLowerCase());
        const actorNameLower = actorName.toLowerCase();
        return movieCast.includes(actorNameLower);
      });
    }

    if (languageMatch) {
      similarMovies = similarMovies.filter((movie) => {
        return movie.original_language.toLowerCase() === languageMatch[1].toLowerCase();
      });
    }

    // Filter out the query movie from the API results
    similarMovies = similarMovies.filter((movie) => movie.id !== queryMovie.id);

    if (similarMovies.length === 0) {
      // Return null if no similar movies found
      return null;
    } else {
      return similarMovies;
    }
  } catch (error) {
    // Catch any errors that occur during the API call
    console.error('Error finding similar movies:', error);
    throw new Error('Sorry! Big F trying to find any similar movies. Please try another search.');
  }
};

module.exports = {
  findSimilarMovies,
};
