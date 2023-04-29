const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Bot response to the `!movieslike` command
const movieslikeCommand = async (input, message, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks) => {
  try {
    if (!input) {
      // Send an intro response to the user if command is just '!movieslike'
      const response = `I am the movieslike bot. Enter the name of a movie and I'll find some similar titles.
        \nFor example: \`!movieslike movieName --genre=genreName --actor=actorName\``;
      await botResponse(message, response);
    } else {
      const movieNameMatch = input.match(movieNamePattern);
      const genreMatches = input.match(genrePattern);
      const actorMatches = input.match(actorPattern);
      const languageMatches = input.match(languagePattern);

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
          include_adult: false,
        },
      });

      if (!data.results || data.results.length === 0) {
        const response =`Sorry! I couldn't find any movies similar to "${movieName}" that match your criteria. 
        This may be because the movie is too unique, or it doesn't have any close matches in my database. 
        Please try a different movie or adjust your search criteria.`;
        await botResponse(message, response);
      } else {
        const queryMovie = data.results[0];

        // Call findSimilarMovies function to get similar movies
        let similarMovies = await findSimilarMovies(queryMovie, queryMovie.release_date, genreMatches, actorMatches, languageMatches);

        if (similarMovies && similarMovies.length > 0) {
          // Generate the movie links
          const movieLinks = generateMovieLinks(similarMovies);

          // Create the response with the movie links and query parameters
          let response = `You searched for movies like ${queryMovie.title}\n`;

          if (genreMatches) {
            response += `Genre: ${genreMatches && genreMatches.map((genre) => genre.trim()).join(', ')}\n`;
          }

          if (actorMatches) {
            response += `Actor: ${actorMatches && actorMatches.map((actor) => actor.trim()).join(', ')}\n`;
          }

          if (languageMatches) {
            response += `Language: ${languageMatches && languageMatches.map((language) => language.trim()).join(', ')}\n`;
          }

          response += '\nHere are a few more you might enjoy...\n\n';
          response += movieLinks;

          await botResponse(message, response);
        } else {
          const response =`Sorry! I couldn't find any movies similar to "${movieName}" that match your search criteria. Please try a new search`;
          await botResponse(message, response);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
    await botResponse(message, 'Sorry, something went wrong. Please try again later.');
  }
};

module.exports = {
  movieslikeCommand
};
