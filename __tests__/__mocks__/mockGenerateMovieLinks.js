const mockGenerateMovieLinks = (similarMovies) => {
  const movieLinks = similarMovies.map(movie => {
    const tmdbUrl = `https://www.themoviedb.org/movie/${movie.id}`;
    return `[${movie.title}](${tmdbUrl})`;
  });

  return movieLinks.join('\n');
};

module.exports = {
  mockGenerateMovieLinks,
};
