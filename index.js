const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { findSimilarMovies } = require('./utils/findByGenre');

const { Client, IntentsBitField, Partials } = require('discord.js');

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

client.on('messageCreate', async message => {
  if (message.content.startsWith('!movieslike')) {
    const movieName = message.content.slice('!movieslike'.length).trim();
    // TODO: Implement logic for finding similar movies based on the given movie
    try {
      if (!movieName) {
        const response = await message.reply('I am the movieslike boy. Enter the name of a movie to find similar movies.');
        console.log(`Message sent: ${response.content}`);
      } else {
        const { data } = await axios.get(`${TMDB_API_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: movieName,
          },
        });

        console.log(data); // log the response from the API
    
        if (data.results.length === 0) {
          const response = await message.reply(`Sorry, I couldn't find a movie called "${movieName}".`);
          console.log(`Message sent: ${response.content}`);
        } else {
          const queryMovie = data.results[0];
    
          const similarMovies = await findSimilarMovies(queryMovie, new Date(queryMovie.release_date));
    
          console.log(similarMovies);
          
          if (similarMovies.length === 0) {
            const response = await message.reply(`Sorry, I couldn't find any similar movies for "${queryMovie.title}".`);
            console.log(`Message sent: ${response.content}`);
          } else {
            const responseMessage = `Similar movies to "${queryMovie.title}" (${queryMovie.release_date.slice(0, 4)}):\n${similarMovies.map(movie => movie.title).join('\n')}`;
            const response = await message.reply(responseMessage);
            console.log(`Message sent: ${response.content}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error sending message: ${error}`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
