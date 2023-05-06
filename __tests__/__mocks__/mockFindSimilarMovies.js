const { mockMoviesArray } = require('../__mocks__/mockMoviesArray');
const { mockSimilarityScore } = require('../__mocks__/mockSimilarityScore');

const mockFindSimilarMovies = (queryMovie, releaseDate, genreMatches, actorMatches, languageMatches) => {
  // Filter movies based on query parameters
  const filteredMovies = mockMoviesArray.filter((movie) => {
    const hasReleaseDate = !releaseDate || movie.release_date === releaseDate;
    const hasMatchingGenre = genreMatches.every((genreId) => movie.genres.some((genre) => genre.id === genreId));
    const hasMatchingActor = actorMatches.every((actorName) =>
      movie.cast.some((castMember) => castMember.name === actorName)
    );
    const hasMatchingLanguage = !languageMatches.length || languageMatches.includes(movie.language);
    return hasReleaseDate && hasMatchingGenre && hasMatchingActor && hasMatchingLanguage;
  });

  // Calculate similarity score for each movie
  const similarityScoredMovies = filteredMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    genre_ids: movie.genres.map((genre) => genre.id),
    similarityScore: mockSimilarityScore(queryMovie, movie.title),
  }));

  // Sort movies by similarity score in descending order
  const sortedMovies = similarityScoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);

  if (sortedMovies.length === 0) {
    return [];
  }

  return sortedMovies;
};

module.exports = {
  mockFindSimilarMovies,
};
