const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client, IntentsBitField, Partials } = require('discord.js');
const { findSimilarMovies } = require('./utils/findSimilarMovies');
const { botResponse } = require('./utils/botResponse');
const { generateMovieLinks } = require('./utils/generateMovieLinks');
const { moreCommand } = require('./utils/commands/more');
const { movieslikeCommand } = require('./utils/commands/movieslike');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('./utils/regExPatterns');
const { STATES, updateState, getCurrentState } = require('./utils/states');

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
  const timestamp = new Date().toLocaleString();
  console.log(`Logged in as ${client.user.tag} at ${timestamp}!`);
});

let currentState = STATES.IDLE;
let currentIndex = 0;

// Discord client event handler brings the robot to life.
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  let similarMovies = [];
  currentState = getCurrentState();

  if (message.content.startsWith('!movieslike')) {
    updateState(STATES.MOVIESLIKE);
    const input = message.content.slice('!movieslike'.length).trim();

    try {
      if (!input) {
        // Send a generic response to the user if input is not provided or if the command is blank (!movieslike)
        const response = `I am the movieslike bot. Enter the name of a movie and I'll find some similar titles.
        \nFor example: \`!movieslike movieName --genre=genreName --actor=actorName\``;
        await botResponse(message, response);
      } else {
        // Call movieslikeCommand function to return movies from TMDB API that are similar to the query movie
        await movieslikeCommand(input, message, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks);
      }

      // Call moreCommand function to show a list of additional movies from similarMovies array
      if (currentState === STATES.MOVIESLIKE && message.content === '!more') {
        await moreCommand(message, similarMovies, currentIndex, botResponse, updateState, STATES, generateMovieLinks);
      }
    } catch (error) {
      console.error(`Error sending message: ${error}`);
      const response = await message.reply('Possible robot mutiny detected. Unable to fetch movie data from TMDB API.');
      console.log(`Message sent: ${response}`);
    }
  }
});


client.login(process.env.DISCORD_BOT_TOKEN);
