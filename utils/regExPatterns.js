// parseInput.js

// Define regex patterns for different query parameters
// Matches --param= followed by any characters except -- and whitespace
const movieNamePattern = /([^--\s]+)/i;
const genrePattern = /--genre=([^--\s]+)/gi;
const actorPattern = /--actor=([^--\s]+)/gi;
const languagePattern = /--language=([^--\s]+)/i;

module.exports = {
  movieNamePattern,
  genrePattern,
  actorPattern,
  languagePattern
};