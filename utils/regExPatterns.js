// Define regex patterns for the different optional query parameters
const movieNamePattern = /([^--]+)/i;
const genrePattern = /(?<=--genre=)[^\s]+(?=\s|$)/gi;
const actorPattern = /(?<=--actor=)[\w\s]+(?=\s|$)/gi;
const languagePattern = /(?<=--language=)[\w\s]+(?=\s|$)/gi;

module.exports = {
  movieNamePattern,
  genrePattern,
  actorPattern,
  languagePattern
};