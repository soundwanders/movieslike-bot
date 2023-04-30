const axios = require('axios');
const { Client, IntentsBitField, Partials } = require('discord.js');
const { mockBotResponse } = require('./__mocks__/mockBotResponse');
const { mockFindSimilarMovies } = require('./__mocks__/mockFindSimilarMovies');
const { mockGenerateMovieLinks } = require('./__mocks__/mockGenerateMovieLinks');
const { mockMovie } = require('./__mocks__/mockMovieObject');
const { mockMoviesArray } = require('./__mocks__/mockMoviesArray');
const { testResponse } = require('./__mocks__/testResponse');
const { movieslikeCommand } = require('../utils/commands/movieslike');
const { generateMovieLinks } = require('../utils/generateMovieLinks');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('../utils/regExPatterns');

describe('movieslikeCommand', () => {
  let client;

  beforeAll(() => {
    // Set up a Discord client so we can test our bot
    client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
      ],
      // partials makes sure bot can respond to certain events before Discord sends back the event data
      partials: [Partials.Channel]
    });
  });

  afterAll(async () => {
    // Log the client out after all tests have completed
    await client.destroy();
  });

  // 1. RETURN VALID RESPONSE TO DEFAULT INPUT
  it('should return similar movies for a valid movie title', async () => {
    const message = { content: '!movieslike Titanic' };
    const response = await movieslikeCommand(
      message.content,
      message,
      testResponse,
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

  // 2. EMPTY MOVIE TITLE RESPONSE
  test('should return a generic response for an empty movie title', async () => {
    const input = '';
    const message = { content: '!movieslike' };
    const botResponse = jest.fn(async () => {});
    const findSimilarMovies = jest.fn(async () => []);
    const generateMovieLinks = jest.fn(() => '');
    
    await movieslikeCommand(
      input, 
      message, 
      botResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      findSimilarMovies, 
      generateMovieLinks
    );
    
    expect(botResponse).toHaveBeenCalled();
    const response = botResponse.mock.calls[0][1];
    expect(response).toMatch(/I am the movieslike bot\. Enter the name of a movie and I'll find some similar titles.\s*For example: `!movieslike movieName --genre=genreName --actor=actorName`/i);  
  });

  // 3. SEND APPROPRIATE MESSAGE IF NO SIMILAR MOVIES FOUND
  test('should return a message indicating no similar movies were found due to an invalid movie title and/or query params', async () => {
    const botResponse = jest.fn();
    const movieName = 'InvalidMovieRoundHound';
    const genre = 'action';
  
    await movieslikeCommand(`!movieslike ${movieName} --genre=${genre}`, {}, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, generateMovieLinks);
  
    expect(botResponse).toHaveBeenCalled();
    const response = botResponse.mock.calls[0][1];
    expect(response).toMatch(/Sorry, there seems to be some invalid query parameter values in your search, please try again!/i);
  });

  // 4. SEND A MESSAGE INDICATING INVALID QUERY PARAMETERS
  it('should return a message indicating invalid query parameters or bad parameter value', async () => {
    const botResponse = jest.fn();
    const movieName = 'Titanic';
    const genre = 'f00dfight'; // this needs to be an invalid genre to test response

    await movieslikeCommand(`!movieslike ${movieName} --genre=${genre}`, {}, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, generateMovieLinks);
  
    expect(botResponse).toHaveBeenCalled();
    const response = botResponse.mock.calls[0][1];
    expect(response).toMatch(/Sorry, there seems to be some invalid query parameter values in your search, please try again!/i);
  });

  // 5. RESPOND WITH A MESSAGE ON ENCOUNTERING AN API ERROR
  it('should respond with an error message when there is an API error', async () => {
    const message = { content: '!movieslike Titanic' };
    const expectedResponse = 'Sorry, looks like I am unable to fetch data from the TMDB API. Please try again later.';
    const testResponseMock = jest.fn();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((error) => {
      console.log(error);
    });

    jest.spyOn(axios, 'get').mockRejectedValue(new Error("Error fetching movie data:"));

    // the expect statement wasn't catching the error from the movieslikeCommand function, causing the test to fail
    // to fix this, we wrap the function call in a try-catch block to check if an error is thrown
    try {
      await movieslikeCommand(
        message.content,
        message,
        testResponseMock,
        movieNamePattern,
        genrePattern,
        actorPattern,
        languagePattern,
        jest.fn(),
        jest.fn()
      );
    } catch (error) {
      expect(error.message).toBe('Error fetching movie data:');
    }

    expect(testResponseMock).toHaveBeenCalledWith(message, expectedResponse);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // 6. RETURN RELEVANT SIMILAR MOVIES USING GENRE QUERY PARAM
  it('should return similar movies based on movie name and genre', async () => {
    const genre = 'Comedy';
    const message = { content: `!movieslike movieName --genre=${genre}` };
    const links = mockGenerateMovieLinks(mockMoviesArray);
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nGenre: ${genre}\n\nHere are a few more you might enjoy...\n\n${links}`;
    await movieslikeCommand(
      message.content,
      message,
      mockBotResponse,
      movieNamePattern,
      genrePattern,
      actorPattern,
      languagePattern,
      mockFindSimilarMovies,
      mockGenerateMovieLinks
    );

    expect(mockBotResponse).toHaveBeenCalledWith(message, expectedResponse);
  });
  
  // 7. RETURN RELEVANT SIMILAR MOVIES USING ACTOR QUERY PARAM
  it('should return similar movies based on movie name and actor', async () => {
    const actor = 'Tom Hanks';
    const input = `!movieslike Castaway --actor=${actor}`;
    const links = mockGenerateMovieLinks(mockMoviesArray);
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nActor: ${actor}\n\nHere are a few more you might enjoy...\n\n${links}`;
  
    await movieslikeCommand(input, message, mockBotResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);
  
    expect(mockBotResponse).toHaveBeenCalledWith(message, expectedResponse);
  });
  
  // 8. RETURN RELEVANT SIMILAR MOVIES USING LANGUAGE QUERY PARAM
  it('should return similar movies based on movie name and language', async () => {
    const language = 'en';
    const input = `!movieslike movieName --language=${language}`;
    const links = mockGenerateMovieLinks(mockMoviesArray);
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nLanguage: ${language}\n\nHere are a few more you might enjoy...\n\n${links}`;
  
    await movieslikeCommand(
      input, 
      message, 
      testResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(testResponse).toHaveBeenCalledWith(message, expectedResponse);
  });

  // 9. RETURN RELEVANT SIMILAR MOVIES USING LANGUAGE AND ACTOR QUERY PARAMS
  it('should return similar movies based on movie name, language, and actor', async () => {
    const language = 'en';
    const input = `!movieslike movieName --language=${language} --actor=${actor}`;
    const links = mockGenerateMovieLinks(mockMoviesArray);
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nLanguage: ${language}\nActor: ${actor}\n\n Here are a few more you might enjoy...\n\n${links}`;
  
    await movieslikeCommand(
      input, 
      message, 
      testResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(testResponse).toHaveBeenCalledWith(message, expectedResponse);
  });
  
  // 10. RETURN RELEVANT SIMILAR MOVIES WHEN ALL OPTIONAL QUERY PARAMETERS ARE INCLUDED
  it('should return similar movies based on movie name, genre, actor, and language', async () => {
    // Set up mock input and parameters for the `movieslike` command
    const input = '!movieslike The Matrix --genre=Action --actor=Keanu Reeves --language=en';
    const message = {};
  
    // Create mock functions for `findSimilarMovies` and `generateMovieLinks`
    const findSimilarMovies = jest.fn(() => Promise.resolve([{ title: 'The Matrix Reloaded', release_date: '2003-05-15' }, { title: 'John Wick', release_date: '2014-10-24' }]));
    const generateMovieLinks = jest.fn((movies) => movies.map((movie) => `${movie.title} (${movie.release_date})`).join('\n'));
  
    // Call the `movieslike` command with the mock input and parameters
    await movieslikeCommand(input, message, testResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks);
  
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('You searched for movies like The Matrix'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('Genre: Action'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('Actor: Keanu Reeves'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('Language: en'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('Here are a few more you might enjoy...'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('The Matrix Reloaded (2003-05-15)'));
    expect(testResponse).toHaveBeenCalledWith(message, expect.stringContaining('John Wick (2014-10-24)'));
  
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
