const mockGenerateMovieLinks = jest.fn((movies) => {
  const numResults = 3;
  const limitedMovies = movies.slice(0, numResults);

  const movieLinks = limitedMovies.map(movie => {
    const tmdbUrl = `https://www.themoviedb.org/${movie.id}`;
    return `[${movie.title}](${tmdbUrl})`;
  });

  return movieLinks.join('\n');
});

module.exports = {
  mockGenerateMovieLinks,
};
