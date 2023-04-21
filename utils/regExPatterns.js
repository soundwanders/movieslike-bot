// Define regex patterns for the different optional query parameters
const movieNamePattern = /([^--]+)/i;
const genrePattern = /(?<=--genre=)[^\s]+(?=\s|$)/gi;
const actorPattern = /(?<=--actor=)[^\s]+(?=\s|$)/gi;
const languagePattern = /--language=([^--\s]+)/i;

module.exports = {
  movieNamePattern,
  genrePattern,
  actorPattern,
  languagePattern
};