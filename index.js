const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client, IntentsBitField, Partials } = require('discord.js');
const { findSimilarMovies } = require('./utils/findMovies');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://www.themoviedb.org';

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

// Set number of results to display
const numResults = 3;

const generateMovieLinks = (movies) => {
  // Limit the number of movies to numResults
  const limitedMovies = movies.slice(0, numResults);

  const movieLinks = limitedMovies.map(movie => {
    const tmdbUrl = `${TMDB_BASE_URL}/movie/${movie.id}`;
    return `[${movie.title}](${tmdbUrl})`;
  });

  // Join the movieLinks array with line breaks
  return movieLinks.join('\n');
};

// Discord client event handler. AKA Bring the robot to life.
client.on('messageCreate', async message => {
  if (message.content.startsWith('!movieslike')) {
    const movieName = message.content.slice('!movieslike'.length).trim();

    try {
      if (!movieName) {
        // Send a response to the user if movie name is not provided
        const response = await message.reply('I am the movieslike bot. Enter the name of a movie to find similar titles.');
        console.log(`Message sent: ${response.content}`);
      } else {
        // Fetch movie data using axios
        const { data } = await axios.get(`${TMDB_API_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: movieName,
          },
        });

        if (!data.results || data.results.length === 0) {
          // Send a response to the user if movie data is not found
          const response = await message.reply(`Sorry, I can't find any movies similar to "${movieName}".`);
          console.log(`Error message sent: ${response.content}`);
        } else {
          // Get the first result as the queryMovie object
          const queryMovie = data.results[0];

          // Convert release_date to a valid time value
          queryMovie.release_date = new Date(queryMovie.release_date).toISOString();
          
          // Call findSimilarMovies function to get similar movies
          const similarMovies = await findSimilarMovies(queryMovie, queryMovie.release_date);

          if (similarMovies && similarMovies.length > 0) {
            // Generate the movie links
            const movieLinks = generateMovieLinks(similarMovies);

            // Create the response with the movie links
            const response = `Here are some similar movies to ${queryMovie.title}: \n${movieLinks}`;
            await message.reply(response);
            console.log(`Message sent: ${response}`);
          } else {
            await message.reply(`Sorry, I can't find any movies similar to "${movieName}".`);
          }
        }
      }
    } catch (error) {
        console.error(`Error sending message: ${error}`);
        const response = await message.reply('Robot mutiny detected. There was an error fetching movie data from the TMDB API.');
        console.log(`Message sent: ${response}`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
