const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// fetch similar movies based on query parameters
const findSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatch) => {
  try {
    // Fetch similar movie data using axios with genre query parameter
    const { data } = await axios.get(`${TMDB_API_URL}/movie/${queryMovie.id}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
        ...(genreMatches && { with_genres: genreMatches.map(genre => genre.trim()).join(',') }),
        append_to_response: 'credits', // Include credits data in API response
      },
    });    

    // Filter similar movies based on actor, language, and release date
    const similarMovies = data.results.filter(movie => {
      // Check if any actor of similar movie matches actorMatches of query movie
      if (actorMatches && actorMatches.length > 0) {
        const actorIds = movie.credits.cast.map(actor => actor.id.toString());
        const actorMatch = actorMatches.some(actor => actorIds.includes(actor));

        if (!actorMatch) return false;
      }
      // Check if language of similar movie matches languageMatch of query movie
      if (languageMatch && languageMatch.length > 0) {
        if (movie.original_language !== languageMatch[1]) return false;
      }
      // Check if release date of similar movie is within the specified date range
      if (releaseDate && movie.release_date) {
        const queryDate = new Date(releaseDate);
        const movieDate = new Date(movie.release_date);
        if (movieDate < queryDate - 40 * 365 * 24 * 60 * 60 * 1000 || movieDate > queryDate + 40 * 365 * 24 * 60 * 60 * 1000) {
          return false;
        }
      }
      return true;
    });

    return similarMovies;
  } catch (error) {
    console.error(`Error fetching similar movies: ${error}`);
    return null;
  }
};

module.exports = {
  findSimilarMovies
};
