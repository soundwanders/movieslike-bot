const path = require('path');
const Discord = require('discord.js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Discord.Client({
  intents: 32767
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.content.startsWith('!movieslike') || message.content.startsWith('/movieslike')) {
    message.channel.send('I am a movieslike bot! Enter the name of a movie to find similar movies.');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
