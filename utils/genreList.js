const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function genreList() {
  const response = await axios.get(`${TMDB_API_URL}/genre/movie/list`, {
    params: {
      api_key: TMDB_API_KEY,
      language: 'en-US',
    },
  });
  return response.data.genres;
}

module.exports = { 
  genreList 
};
