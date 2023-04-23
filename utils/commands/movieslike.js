const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Fetch movie data from TMDB API
const movieslikeCommand = async (input, message, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks) => {
  try {
    if (!input) {
      // Send a generic response to the user if input is not provided or command is blank
      const response = `I am the movieslike bot. Enter the name of a movie and I'll find some similar titles.
        \nFor example: \`!movieslike movieName --genre=genreName --actor=actorName\``;
      await botResponse(message, response);
    } else {
      const movieNameMatch = input.match(movieNamePattern);
      const genreMatches = input.match(genrePattern);
      const actorMatches = input.match(actorPattern);
      const languageMatches = input.match(languagePattern);

      console.log('movieNameMatch', movieNameMatch);
      console.log('genreMatches', genreMatches);
      console.log('actorMatches', actorMatches);
      console.log('languageMatches', languageMatches);
      
      const movieName = movieNameMatch ? movieNameMatch[1].trim() : null;

      // Fetch movie data using axios with query parameters
      // Add genre, actor, language query params if available
      const { data } = await axios.get(`${TMDB_API_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: movieName,
          ...(genreMatches && { with_genres: genreMatches.map((genre) => genre.trim()).join(',') }),
          ...(actorMatches && { with_cast: actorMatches.map((actor) => actor.trim()).join(',') }),
          ...(languageMatches && { with_original_language: languageMatches[1] }),
        },
      });

      if (!data.results || data.results.length === 0) {
        // Send a response to the user if movie data is not found
        await botResponse(message, `Sorry, I can't find any movies similar to "${movieName}".`);
      } else {
        const queryMovie = data.results[0];

        // Call findSimilarMovies function to get similar movies
        let similarMovies = await findSimilarMovies(queryMovie, queryMovie.release_date, genreMatches, actorMatches, languageMatches);

        if (similarMovies && similarMovies.length > 0) {
          // Generate the movie links
          const movieLinks = generateMovieLinks(similarMovies);

          // Create the response with the movie links
          const response = `Here are some movies that are similar to ${queryMovie.title}: \n${movieLinks}`;
          await botResponse(message, response);
        } else {
          await message.reply(`Sorry! I can't find any movies similar to "${movieName}".`);
        }
      }
    }
  } catch (error) {
    // Handle any errors that occur during movie data fetching
    console.error('Error fetching movie data:', error);
    await botResponse(message, 'Sorry, something went wrong. Please try again later.');
  }
};

module.exports = {
  movieslikeCommand
};
