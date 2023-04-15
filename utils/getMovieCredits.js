const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function getMovieCredits(movieId) {
  try {
    const queryParams = {
      api_key: TMDB_API_KEY,
    };

    const { data } = await axios.get(`${TMDB_API_URL}/movie/${movieId}/credits`, {
      params: queryParams,
    });

    return data;

  } catch (error) {
    console.error(`Error getting movie credits for movie ID ${movieId}: ${error.message}`);
    return null;
  }
}

module.exports = {
  getMovieCredits,
};
