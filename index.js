const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Client, IntentsBitField, Partials } = require('discord.js');

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
        const response = await message.reply('I am a movieslike bot! Enter the name of a movie to find similar movies.');
        console.log(`Message sent: ${response.content}`);
      } else {
        // TODO: Implement logic for finding similar movies based on the given movie
        const response = await message.reply('I am an egg bot. Please donate to the church of Dr. Ivo Robotnik.');
        console.log(`Message sent: ${response.content}`);
      }
    } catch (error) {
      console.error(`Error sending message: ${error}`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
