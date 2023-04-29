const axios = require('axios');
const { Client, Intents } = require('discord.js');
const { botResponse } = require('./utils/botResponse');
const { movieslikeCommand } = require('./utils/commands/movieslike');
const { botResponse } = require('../utils/botResponse');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('../utils/regExPatterns');

const mockBotResponse = jest.fn(); 

describe('movieslikeCommand', () => {
  let client;

  beforeAll(() => {
    // Set up a Discord client so we can test our bot
    client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  });

  afterAll(async () => {
    // Log the client out after all tests have completed
    await client.destroy();
  });

  it('should return similar movies for a valid movie title', async () => {
    const message = { content: '!movieslike Titanic' };
    const response = await movieslikeCommand(
      message.content,
      message,
      botResponse,
      movieNamePattern,
      genrePattern,
      actorPattern,
      languagePattern,
      jest.fn(),
      jest.fn()
    );
    expect(response).not.toBeNull();
    expect(response).not.toBe('');
  });

  it('should return a generic response for an empty movie title', async () => {
    const message = { content: '!movieslike' };
    const response = await movieslikeCommand(
      message.content,
      message,
      botResponse,
      movieNamePattern,
      genrePattern,
      actorPattern,
      languagePattern,
      jest.fn(),
      jest.fn()
    );
    expect(response).toMatch(/I am the movieslike bot\./i);
  });

  it('should return a message indicating no similar movies were found for an invalid movie title', async () => {
    const message = { content: '!movieslike InvalidMovieTitle' };
    const response = await movieslikeCommand(
      message.content,
      message,
      botResponse,
      movieNamePattern,
      genrePattern,
      actorPattern,
      languagePattern,
      jest.fn(),
      jest.fn()
    );
    expect(response).toMatch(/Sorry, I couldn't find any similar movies for that title\./i);
  });
  
  it('should return a message indicating invalid input parameters for an invalid parameter value', async () => {
    const message = { content: '!movieslike Titanic --genre=InvalidGenre' };
    const response = await movieslikeCommand(
      message.content,
      message,
      botResponse,
      movieNamePattern,
      genrePattern,
      actorPattern,
      languagePattern,
      jest.fn(),
      jest.fn()
    );
    expect(response).toMatch(/Sorry, that is not a valid input parameter value\./i);
  });

  it('should respond with an error message when there is an API error', async () => {
    const error = new Error('Error fetching movie data');
    const expectedResponse = 'Sorry, something went wrong. Please try again later.';
    jest.spyOn(axios, 'get').mockRejectedValue(error);
  
    await movieslikeCommand(validInput, mockMessage, mockBotResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);
  
    expect(mockBotResponse).toHaveBeenCalledWith(mockMessage, expectedResponse);
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('should return similar movies based on movie name and genre', async () => {
    const genre = 'Comedy';
    const input = `!movieslike movieName --genre=${genre}`;
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nGenre: ${genre}\n\nHere are a few more you might enjoy...\n\n${mockMovieLinks}`;
  
    await movieslikeCommand(input, mockMessage, mockBotResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);
  
    expect(mockBotResponse).toHaveBeenCalledWith(mockMessage, expectedResponse);
  });
  
  it('should return similar movies based on movie name and actor', async () => {
    const actor = 'Tom Hanks';
    const input = `!movieslike movieName --actor=${actor}`;
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nActor: ${actor}\n\nHere are a few more you might enjoy...\n\n${mockMovieLinks}`;
  
    await movieslikeCommand(input, mockMessage, mockBotResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);
  
    expect(mockBotResponse).toHaveBeenCalledWith(mockMessage, expectedResponse);
  });
  
  it('should return similar movies based on movie name and language', async () => {
    const language = 'en';
    const input = `!movieslike movieName --language=${language}`;
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nLanguage: ${language}\n\nHere are a few more you might enjoy...\n\n${mockMovieLinks}`;
  
    await movieslikeCommand(
      input, 
      mockMessage, 
      mockBotResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(mockBotResponse).toHaveBeenCalledWith(mockMessage, expectedResponse);
  });
  
  it('should return similar movies based on movie name, genre, actor, and language', async () => {
    // Set up mock input and parameters for the `movieslike` command
    const input = '!movieslike The Matrix --genre=Action --actor=Keanu Reeves --language=en';
    const message = {};
  
    // Create mock functions for `findSimilarMovies` and `generateMovieLinks`
    const findSimilarMovies = jest.fn(() => Promise.resolve([{ title: 'The Matrix Reloaded', release_date: '2003-05-15' }, { title: 'John Wick', release_date: '2014-10-24' }]));
    const generateMovieLinks = jest.fn((movies) => movies.map((movie) => `${movie.title} (${movie.release_date})`).join('\n'));
  
    // Call the `movieslike` command with the mock input and parameters
    await movieslikeCommand(input, message, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks);
  
    // Expect that the `botResponse` function was called with the expected message
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('You searched for movies like The Matrix'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('Genre: Action'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('Actor: Keanu Reeves'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('Language: en'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('Here are a few more you might enjoy...'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('The Matrix Reloaded (2003-05-15)'));
    expect(botResponse).toHaveBeenCalledWith(message, expect.stringContaining('John Wick (2014-10-24)'));
  
    // Expect that `findSimilarMovies` and `generateMovieLinks` were called with the expected arguments
    expect(findSimilarMovies).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'The Matrix' }),
      '1999-03-30',
      expect.arrayContaining(['Action']),
      expect.arrayContaining(['Keanu Reeves']),
      expect.arrayContaining(['en'])
    );
    expect(generateMovieLinks).toHaveBeenCalledWith(
      expect.arrayContaining([{ title: 'The Matrix Reloaded', release_date: '2003-05-15' }, { title: 'John Wick', release_date: '2014-10-24' }])
    );
  });
  
});
