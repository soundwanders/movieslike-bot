const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client, IntentsBitField, Partials } = require('discord.js');
const { findSimilarMovies } = require('./utils/findMovies');
const { generateMovieLinks } = require('./utils/generateMovieLinks');
const { botResponse } =require('./utils/botResponse');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('./utils/regExPatterns');
const { STATES, updateState, getCurrentState } = require('./utils/states');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ],
  
  // [Partials.Channel] means the bot will cache channels as partials
  // partials makes sure the bot can respond to certain events before Discord sends back the event data
  partials: [Partials.Channel]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Discord client event handler brings the robot to life.
client.on('messageCreate', async (message) => {
  let similarMovies = [];
  let currentIndex = 0;
  
  currentState = getCurrentState();

  if (message.content.startsWith('!movieslike')) {
    updateState(STATES.MOVIESLIKE);

    const input = message.content.slice('!movieslike'.length).trim();

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
        const languageMatch = input.match(languagePattern);

        const movieName = movieNameMatch ? movieNameMatch[1].trim() : null;

        // Fetch movie data using axios with query parameters
        // Add genre, actor, language query params if available
        const { data } = await axios.get(`${TMDB_API_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: movieName,
            ...(genreMatches && { with_genres: genreMatches.map((genre) => genre.trim()).join(',') }),
            ...(actorMatches && { with_cast: actorMatches.map((actor) => actor.trim()).join(',') }),
            ...(languageMatch && { with_original_language: languageMatch[1] }),
          },
        });

        if (!data.results || data.results.length === 0) {
          // Send a response to the user if movie data is not found
          await botResponse(message, `Sorry, I can't find any movies similar to "${movieName}".`);
        } else {
          const queryMovie = data.results[0];

          // Call findSimilarMovies function to get similar movies
          similarMovies = await findSimilarMovies(queryMovie, queryMovie.release_date, genreMatches, actorMatches, languageMatch);
        
          if (similarMovies && similarMovies.length > 0) {
            // Generate the movie links
            const movieLinks = generateMovieLinks(similarMovies);
        
            // Create the response with the movie links
            const response = `Here are some movies that are similar to ${queryMovie.title}: \n${movieLinks}`;
            await botResponse(message, response);
          } else {
            await message.reply(`Sorry! I can't find any movies similar to "${movieName}".`);
          }
        
          if (currentState === STATES.MOVIESLIKE && message.content === '!more') {
            // Handle the "MORE" state
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
          }
        }
      }
    } catch (error) {
      console.error(`Error sending message: ${error}`);
      const response = await message.reply('Possible robot mutiny detected. Unable to fetch movie data from TMDB API.');
      console.log(`Message sent: ${response}`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
