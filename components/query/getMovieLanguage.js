const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function getMovieLanguage(movieId, language) {
  const response = await axios.get(`${TMDB_API_URL}/movie/${movieId}`, {
    params: {
      api_key: TMDB_API_KEY,
      language: language || 'en-US',
    },
  });
  return response.data;
}

module.exports = { 
  getMovieLanguage 
};
