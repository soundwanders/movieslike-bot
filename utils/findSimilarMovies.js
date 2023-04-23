const axios = require('axios');
const { getMovieCredits } = require('./getMovieCredits');
const { getMovieLanguage } = require('./getMovieLanguage');
const { genreList } = require('./genreList');
const { languageMap } = require('./languageMap');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Find similar movies based on shared genres and additional query parameters if present
const findSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatches) => {
  try {
    // Calculate range based on the release date of the query movie
    const releaseYear = new Date(releaseDate).getFullYear();
    const minReleaseYear = releaseYear - 40;
    const maxReleaseYear = releaseYear + 40;
    
    // Normalize language input to Unicode value
    // for example, 'english' would be converted to its language code, 'en'
    const normalizedLanguageMatches = languageMatches.map((language) => {
      const normalizedLanguage = languageMap[language.toLowerCase()];
      return normalizedLanguage || language;
    });

    // Create an array of Unicode language values
    const unicodeLanguageMatches = languageMatches.map((language) => {
      return languageMap[language.toLowerCase()];
    });
    
    const languageValues = [...normalizedLanguageMatches, ...unicodeLanguageMatches].filter((language) => language);
    
    const { data } = await axios.get(`${TMDB_API_URL}/movie/${queryMovie.id}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreMatches && genreMatches.map((genre) => genre.trim()).join(','),
        with_cast: actorMatches && actorMatches.map((actor) => actor.trim()).join(','),
        with_original_language: languageValues && languageValues.map((language) => language.trim()).join(','),
        'primary_release_date.gte': `${minReleaseYear}-01-01`,
        'primary_release_date.lte': `${maxReleaseYear}-12-31`,
        page: 1,
      },
    });

    let similarMovies = data.results;

    // Calculate similarity score for each movie to improve search results
    similarMovies = similarMovies.map((movie) => {
      const sharedGenres = movie.genre_ids.filter((genreId) => queryMovie.genre_ids.includes(genreId));
      movie.sharedGenres = sharedGenres.length;
      movie.similarityScore = movie.sharedGenres;

      return movie;
    });

    // Sort movies based on similarity score in descending order
    similarMovies.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filter our query movie from the API results
    similarMovies = similarMovies.filter((movie) => movie.id !== queryMovie.id);

    // Define empty array which will be populated with our filtered movies
    let filteredMovies = [];

    // Fetch the list of query movie's genres
    const genreArray = await genreList();

    for (const movie of similarMovies) {
       // Create a flag variable to keep track of which movies should be included in search results
      let includeMovie = true;

      // Check if any of query movie's genre match the user's genre query
      if (genreMatches) {
        const genres = movie.genre_ids.map((id) => genreArray.find((genre) => genre.id === id).name.toLowerCase());
        const genreMatchesLower = genreMatches.map((genre) => genre.toLowerCase());
        includeMovie = genreMatchesLower.every((genre) => genres.includes(genre));
      }

      // Check if any actors/actresses from query movie match user's actor query
      if (actorMatches && includeMovie) {
        const movieCredits = await getMovieCredits(movie.id);
        const movieCast = movieCredits.cast.map((cast) => cast.name.toLowerCase());
        const actorMatchesLower = actorMatches.map((actor) => actor.toLowerCase());
        includeMovie = actorMatchesLower.some((actor) => movieCast.includes(actor));
      }

      // Check if query movie's original language matches user's language query
      if (languageMatches && includeMovie) {
        const queryLanguage = languageMatches.map((language) => language.toLowerCase());
        includeMovie = queryLanguage.includes(movie.original_language.toLowerCase());
        
        if (!includeMovie) {
          const movieDetails = await getMovieLanguage(movie.id);
          includeMovie = movieDetails.spoken_languages.some((movieLanguage) => {
            return queryLanguage.includes(movieLanguage.name.toLowerCase());
          });
        }
      }

      if (includeMovie) {
        filteredMovies.push(movie);
      }
    };

    if (filteredMovies.length === 0) {
      return null;
    };

    // Sort movies based on popularity in descending order
    filteredMovies.sort((a, b) => b.popularity - a.popularity);

    return filteredMovies;
  } catch (error) {
    console.error('Error finding similar movies:', error);
    throw new Error('Sorry! Failed to find any similar movies. Please try another search.');
  }
};

module.exports = {
  findSimilarMovies,
};
