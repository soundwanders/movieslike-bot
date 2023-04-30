const mockFindSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatches) => {
  const similarMovies = [
    { id: 1, sharedGenres: 2, similarityScore: 2 },
    { id: 2, sharedGenres: 1, similarityScore: 1 },
    { id: 3, sharedGenres: 3, similarityScore: 3 },
    { id: 4, sharedGenres: 0, similarityScore: 0 },
  ];

  const genreArray = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction'];
  const languageMap = { english: 'en', spanish: 'es', french: 'fr' };

  const filteredMovies = similarMovies
    .filter((movie) => movie.id !== queryMovie.id)
    .filter((movie) => {
      if (genreMatches) {
        const genres = genreArray.filter((genre) => movie.id % 2 === 0 && genreMatches.includes(genre.toLowerCase()));
        return genres.length === genreMatches.length;
      }
      return true;
    })
    .filter((movie) => {
      if (actorMatches) {
        const actors = ['Actor 1', 'Actor 2', 'Actor 3'].filter((actor) => movie.id % 3 === 0 && actorMatches.includes(actor.toLowerCase()));
        return actors.length > 0;
      }
      return true;
    })
    .filter((movie) => {
      if (languageMatches) {
        const queryLanguages = languageMatches.map((language) => languageMap[language.toLowerCase()]);
        return queryLanguages.includes('en') || queryLanguages.includes('es');
      }
      return true;
    })
    .sort((a, b) => b.similarityScore - a.similarityScore);

  if (filteredMovies.length === 0) {
    return null;
  }

  return filteredMovies;
};

module.exports = {
  mockFindSimilarMovies,
};
