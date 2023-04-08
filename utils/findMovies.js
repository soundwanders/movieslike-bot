const axios = require('axios');
const { getMovieCredits } = require('./getMovieCredits');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

async function findSimilarMovies(queryMovie, queryMovieReleaseDate) {
  if (!queryMovie || !queryMovie.title || !queryMovie.release_date || !queryMovie.genre_ids) {
    throw new Error('Invalid input: queryMovie is missing title, release_date, or genre_ids');
  }

  try {
    const queryParams = {
      api_key: TMDB_API_KEY
    };

    // Use an object to store the mapping between query parameters and their corresponding values,
    // then iterate through the keys of our object and add them to the queryParams if their values are truthy
    const parameterMapping = {
      actors: 'with_cast',
      genres: 'with_genres',
      language: 'language',
      sort_by: 'sort_by',
    };

    // Add release_date parameters (released within 40 years of query movie)
    if (queryMovieReleaseDate) {
      const queryDate = new Date(queryMovieReleaseDate);
      if (!isNaN(queryDate)) { // Check if the date is valid
        queryParams['release_date.gte'] = new Date(queryDate - 40 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        queryParams['release_date.lte'] = new Date(queryDate + 40 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }
    }

    // Fetch credits for the given movie using getMovieCredits function
    const [credits, { data }] = await Promise.all([
      getMovieCredits(queryMovie.id),
      axios.get(`${TMDB_API_URL}/movie/${queryMovie.id}/similar`, {
        params: queryParams,
      }),
    ]);

    const actors = credits ? credits.cast.map(actor => actor.name) : []; // Extract actors from credits
    queryParams[parameterMapping.actors] = actors.join(',');

    return data.results;
  } catch (error) {
    console.error(`Error finding similar movies for ${queryMovie.title}: ${error.message}`);
    return [];
  }
}

module.exports = {
  findSimilarMovies,
};
