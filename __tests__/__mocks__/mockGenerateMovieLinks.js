const mockGenerateMovieLinks = jest.fn((movies) => {
  // Limit the number of movies to numResults
  const numResults = 3;
  const limitedMovies = movies.slice(0, numResults);

  const movieLinks = limitedMovies.map(movie => {
    const tmdbUrl = `https://www.themoviedb.org/${movie.id}`;
    return `[${movie.title}](${tmdbUrl})`;
  });

  // Join movieLinks array with line breaks
  return movieLinks.join('\n');
});

module.exports = {
  mockGenerateMovieLinks,
};
