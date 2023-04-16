const moreCommand = async (message, similarMovies, currentIndex, botResponse, updateState, STATES, generateMovieLinks) => {
  if (similarMovies && similarMovies.length > 0) {
    // Calculate the index for the next set of movies
    const nextIndex = currentIndex + 3;

    // Check if there are more movies to show
    if (nextIndex < similarMovies.length) {
      // Generate the movie links for the next set of movies
      const nextMovies = similarMovies.slice(currentIndex, nextIndex);
      const movieLinks = generateMovieLinks(nextMovies);

      // Create the response with the movie links
      const response = `Here are more similar movies you might like: \n${movieLinks}`;
      await botResponse(message, response);

      // Update the current index
      currentIndex = nextIndex;
    } else {
      // If there are no more movies to show, transition back to MOVIESLIKE state
      const response = "No more similar movies found. Returning to movieslike state.";
      await botResponse(message, response);
      updateState(STATES.MOVIESLIKE);
    }
  }
};

module.exports = {
  moreCommand
};
