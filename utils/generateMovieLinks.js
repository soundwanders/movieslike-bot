const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://www.themoviedb.org';

// Set number of results to display
const numResults = 3;

const generateMovieLinks = (movies) => {
  // Limit the number of movies to numResults
  const limitedMovies = movies.slice(0, numResults);

  const movieLinks = limitedMovies.map(movie => {
    const tmdbUrl = `${TMDB_BASE_URL}/movie/${movie.id}`;
    return `[${movie.title}](${tmdbUrl})`;
  });

  console.log(movieLinks);

  // Join movieLinks array with line breaks
  return movieLinks.join('\n');
};

module.exports = {
  generateMovieLinks,
};
