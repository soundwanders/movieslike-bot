const mockFindSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatches) => {
  const genreArray = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction'];

  const filteredMovies = mockMoviesArray
  .filter((movie) => movie.id !== queryMovie.id)
  .filter((movie) => {
    if (genreMatches) {
      const genres = genreArray.filter((genre) => movie.genre_ids.includes(genreMatches.toLowerCase()));
      return genres.length > 0;
    }
    return true;
  })
  .filter((movie) => {
    if (languageMatches) {
      const queryLanguages = languageMatches.map((language) => languageMap[language.toLowerCase()]);
      return queryLanguages.includes(movie.original_language);
    }
    return true;
  })
  .filter((movie) => {
    if (actorMatches) {
      const actors = ['Actor 1', 'Actor 2', 'Actor 3'].filter((actor) => movie.cast.includes(actor.toLowerCase()));
      return actors.length > 0;
    }
    return true;
  })
  .sort((a, b) => b.popularity - a.popularity);

  if (filteredMovies.length === 0) {
    return null;
  }

  return filteredMovies;
};


module.exports = {
  mockFindSimilarMovies,
};
