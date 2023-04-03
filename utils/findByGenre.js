const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function findSimilarMovies(queryMovie, queryMovieReleaseDate) {
  if (!queryMovie || !queryMovie.title || !queryMovie.release_date || !queryMovie.genre_ids) {
    throw new Error('Invalid input: queryMovie is missing title, release_date, or genre_ids');
  }

  try {
    const { data } = await axios.get(`${TMDB_API_URL}/movie/${queryMovie.id}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: queryMovie.genre_ids.join(','),
        'release_date.gte': new Date(queryMovieReleaseDate - 20 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        'release_date.lte': new Date(queryMovieReleaseDate + 20 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
    });

    return data.results;
  } catch (error) {
    console.error(`Error finding similar movies for ${queryMovie.title}: ${error.message}`);
    return [];
  }
}

module.exports = {
  findSimilarMovies,
};
