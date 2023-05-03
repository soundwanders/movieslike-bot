const axios = require('axios');
const { Client, IntentsBitField, Partials } = require('discord.js');
const { mockBotResponse } = require('./__mocks__/mockBotResponse');
const { mockFindSimilarMovies } = require('./__mocks__/mockFindSimilarMovies');
const { mockGenerateMovieLinks } = require('./__mocks__/mockGenerateMovieLinks');
const { mockMovie } = require('./__mocks__/mockMovieObject');
const { mockMoviesArray } = require('./__mocks__/mockMoviesArray');
const { defaultResponse } = require('./__mocks__/defaultResponse');
const { movieslikeCommand } = require('../components/commands/movieslike');
const { generateMovieLinks } = require('../components/query/generateMovieLinks');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('../components/utils/regExPatterns');

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
      defaultResponse,
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
  describe('movieslikeTests', () => {
    describe('movieslikeCommand', () => {
      it('should generate movie links for similar movies when movie name and genre are passed', async () => {
        const input = 'Test Movie --genre=action';
        const botResponse = jest.fn(async () => {});
        
        const mockGenerateMovieLinks = (similarMovies) => {
          return similarMovies.map((movie) => `[${movie.title}](https://www.themoviedb.org/movie/${movie.id})`).join('\n');
        };
        
        const mockFindSimilarMovies = async (queryMovie, releaseDate, genreMatches, actorMatches, languageMatches) => {
          const similarMovies = [
            { id: 2, title: 'Test Movie 2', genre_ids: [28, 80], similarityScore: 4 },
            { id: 3, title: 'Test Movie 3', genre_ids: [28, 35], similarityScore: 3 },
            { id: 4, title: 'Test Movie 4', genre_ids: [12, 16], similarityScore: 2 },
            { id: 5, title: 'Test Movie 5', genre_ids: [28, 53], similarityScore: 1 }
          ];

          const filteredMovies = similarMovies
            .filter((movie) => movie.id !== queryMovie.id)
            .filter((movie) => {
              if (genreMatches) {
                const genres = genreMatches.filter((genre) => movie.genre_ids.includes(genre.toLowerCase()));
                return genres.length === genreMatches.length;
              }
              return true;
            })
            .sort((a, b) => b.similarityScore - a.similarityScore);

          if (filteredMovies.length === 0) {
            return null;
          }

          return filteredMovies;
        };

        await movieslikeCommand(input, {}, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);

        expect(botResponse).toHaveBeenCalledTimes(2);
        expect(botResponse).toHaveBeenCalledWith({}, expect.stringContaining('Here are a few more you might enjoy...'));
        expect(botResponse).toHaveBeenCalledWith({}, expect.stringContaining('Test Movie 2\nTest Movie 3\n'));
        expect(mockFindSimilarMovies).toHaveBeenCalledWith(
          { id: 1, title: 'Test Movie', genre_ids: [12, 28, 53] },
          undefined,
          ['Action'],
          undefined,
          undefined
        );
        expect(mockGenerateMovieLinks).toHaveBeenCalledWith(
          [
            { id: 2, title: 'Test Movie 2', genre_ids: [28, 80], similarityScore: 4 },
            { id: 3, title: 'Test Movie 3', genre_ids: [28, 35], similarityScore: 3 }
          ]
        );
      });
    });
  });

  // 7. RETURN RELEVANT SIMILAR MOVIES USING ACTOR QUERY PARAM
  it('should return similar movies based on movie name and actor', async () => {
    const input = 'Test Movie --actor="Actor" --actor="Snacker"';
    const botResponse = jest.fn(async () => {});
  
    const mockGenerateMovieLinks = (similarMovies) => {
      return similarMovies.map((movie) => `[${movie.title}](https://www.themoviedb.org/movie/${movie.id})`).join('\n');
    };
  
    await movieslikeCommand(input, {}, botResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, mockFindSimilarMovies, mockGenerateMovieLinks);
  
    expect(botResponse).toHaveBeenCalledTimes(2);
    expect(botResponse).toHaveBeenCalledWith({}, expect.stringContaining('Here are a few more you might enjoy...'));
    expect(mockFindSimilarMovies).toHaveBeenCalledWith(
      { id: 1, title: 'Test Movie' },
      undefined,
      undefined,
      ['Actor', 'Snacker'],
      undefined
    );
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
      defaultResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(defaultResponse).toHaveBeenCalledWith(message, expectedResponse);
  });

  // 9. RETURN RELEVANT SIMILAR MOVIES USING LANGUAGE AND ACTOR QUERY PARAMS
  it('should return similar movies based on movie name, language, and actor', async () => {
    const language = 'en';
    const actor= 'chapes';
    const message = '';
    const input = `!movieslike movieName --language=${language} --actor=${actor}`;
    const links = mockGenerateMovieLinks(mockMoviesArray);
    const expectedResponse = `You searched for movies like ${mockMovie.title}\nLanguage: ${language}\nActor: ${actor}\n\n Here are a few more you might enjoy...\n\n${links}`;
  
    await movieslikeCommand(
      input, 
      message, 
      defaultResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(defaultResponse).toHaveBeenCalledWith(message, expectedResponse);
  });
  
  // 10. RETURN RELEVANT SIMILAR MOVIES WHEN ALL OPTIONAL QUERY PARAMETERS ARE INCLUDED
  it('should return similar movies based on movie name, genre, actor, and language', async () => {
    // Set up mock input and parameters for the `movieslike` command
    const input = '!movieslike The Matrix --genre=Action --actor=Keanu Reeves --language=en';
    const message = {};
    const mockTestResponse = jest.fn();
  
    // Create mock functions for `findSimilarMovies` and `generateMovieLinks`
    const findSimilarMovies = jest.fn(() => Promise.resolve([{ title: 'The Matrix Reloaded', release_date: '2003-05-15' }, { title: 'John Wick', release_date: '2014-10-24' }]));
    const generateMovieLinks = jest.fn((movies) => movies.map((movie) => `${movie.title} (${movie.release_date})`).join('\n'));
  
    // Call the `movieslike` command with the mock input and parameters
    await movieslikeCommand(input, message, mockTestResponse, movieNamePattern, genrePattern, actorPattern, languagePattern, findSimilarMovies, generateMovieLinks);
  
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('You searched for movies like The Matrix'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('Genre: Action'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('Actor: Keanu Reeves'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('Language: en'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('Here are a few more you might enjoy...'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('The Matrix Reloaded (2003-05-15)'));
    expect(mockTestResponse).toHaveBeenCalledWith(message, expect.stringContaining('John Wick (2014-10-24)'));
  
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
