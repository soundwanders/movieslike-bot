// Define regex patterns for the different optional query parameters
const movieNamePattern = /([^--\s]+)/i;
const genrePattern = /(?<=--genre=)[^\s]+/gi;
const actorPattern = /(?<=--actor=)[^\s]+/gi;
const languagePattern = /--language=([^--\s]+)/i;

module.exports = {
  movieNamePattern,
  genrePattern,
  actorPattern,
  languagePattern
};