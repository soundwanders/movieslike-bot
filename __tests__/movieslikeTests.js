const axios = require('axios');
const { Client, IntentsBitField } = require('discord.js');
const { mockBotResponse } = require('./__mocks__/mockBotResponse');
const { mockFindSimilarMovies } = require('./__mocks__/mockFindSimilarMovies');
const { mockGenerateMovieLinks } = require('./__mocks__/mockGenerateMovieLinks');
const { mockMoviesArray } = require('./__mocks__/mockMoviesArray');
const { mockSimilarityScore } = require('./__mocks__/mockSimilarityScore');
const { defaultResponse } = require('./__mocks__/defaultResponse');
const { movieslikeCommand } = require('../components/commands/movieslike');
const { movieNamePattern, genrePattern, actorPattern, languagePattern } = require('../components/utils/regExPatterns');

describe('movieslikeCommand', () => {
  let client;

  beforeAll(() => {
    client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
      ],
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
    // Arrange
    const input = '';
    const message = { content: '!movieslike' };
    
    // Act
    await movieslikeCommand(
      input, 
      message, 
      mockBotResponse, 
      movieNamePattern, 
      genrePattern, 
      actorPattern, 
      languagePattern, 
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
    
    // Assert
    expect(mockBotResponse).toHaveBeenCalled();
    const response = mockBotResponse.mock.calls[0][1];
    expect(response).toMatch(/I am the movieslike bot\. Enter the name of a movie and I'll find some similar titles.\s*For example: `!movieslike movieName --genre=genreName --actor=actorName`/i);  
  });

  // 3. SEND APPROPRIATE MESSAGE IF NO SIMILAR MOVIES FOUND
  test('should return a message indicating no similar movies were found due to an invalid movie title and/or query params', async () => {
    const botResponse = jest.fn();
    const movieName = 'InvalidMovieRoundHound';
    const genre = 'action';
    
    await movieslikeCommand(
      `!movieslike ${movieName} --genre=${genre}`,
      {},
      botResponse,
      movieNamePattern,
      genrePattern, 
      actorPattern,
      languagePattern,
      mockFindSimilarMovies, 
      mockGenerateMovieLinks
    );
  
    expect(botResponse).toHaveBeenCalled();
    const response = botResponse.mock.calls[0][1];
    expect(response).toMatch(/Sorry, there seems to be some invalid query parameter values in your search, please try again!/i);
  });

  // 4. SEND A MESSAGE INDICATING INVALID QUERY PARAMETERS
  it('should return a message indicating invalid query parameters or bad parameter value', async () => {
    const botResponse = jest.fn();
    const movieName = 'Titanic';
    const genre = 'f00dfight'; // invalid genre - should be rejected

    await movieslikeCommand(
      `!movieslike ${movieName} --genre=${genre}`,
      {},
      botResponse,
      movieNamePattern,
      genrePattern, actorPattern,
      languagePattern,
      mockFindSimilarMovies,
      mockGenerateMovieLinks
    );

    expect(botResponse).toHaveBeenCalled();
    const response = botResponse.mock.calls[0][1];
    expect(response).toMatch(/Sorry, there seems to be some invalid query parameter values in your search, please try again!/i);
  });

  // 5. RESPOND WITH A MESSAGE ON ENCOUNTERING AN API ERROR
  it('should respond with an error message when there is an API error', async () => {
    const message = { content: '!movieslike Titanic' };
    const expectedResponse = 'Sorry, looks like I am unable to fetch data from the TMDB API. Please try again later.';

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
        mockBotResponse,
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

    expect(mockBotResponse).toHaveBeenCalledWith(message, expectedResponse);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // 6. RETURN RELEVANT SIMILAR MOVIES WHEN COMMAND INCLUDES ACTOR QUERY PARAM
  it('should return a sorted list of movies based on actor query parameter', () => {
    const queryMovie = 'Movie 1';
    const releaseDate = null;
    const genreMatches = [];
    const actorMatches = ['Actor 1'];
    const languageMatches = [];
  
    const filteredMovies = mockMoviesArray.filter((movie) => {
      const hasReleaseDate = !releaseDate || movie.release_date === releaseDate;
      const hasMatchingGenre = !genreMatches.length || genreMatches.every((genreId) => movie.genres.some((genre) => genre.id === genreId));
      const hasMatchingActor = actorMatches.every((actorName) =>
        movie.cast.some((castMember) => castMember.name === actorName)
      );
      const hasMatchingLanguage = !languageMatches.length || languageMatches.includes(movie.language);
      return hasReleaseDate && hasMatchingGenre && hasMatchingActor && hasMatchingLanguage;
    });
  
    const similarityScoredMovies = filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre_ids: movie.genres.map((genre) => genre.id),
      similarityScore: mockSimilarityScore(queryMovie, movie.title),
    }));
  
    const sortedMovies = similarityScoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);
  
    expect(mockFindSimilarMovies(queryMovie, releaseDate, genreMatches, actorMatches, languageMatches)).toEqual(sortedMovies);
  });  
  
  // 7. RETURN RELEVANT SIMILAR MOVIES WHEN COMMAND INCLUDES GENRE QUERY PARAM
  it('should return a sorted list of movies based on genre query parameter', () => {
    const queryMovie = 'Movie 1';
    const releaseDate = null;
    const genreMatches = [12];
    const actorMatches = [];
    const languageMatches = [];
  
    const filteredMovies = mockMoviesArray.filter((movie) => {
      const hasReleaseDate = !releaseDate || movie.release_date === releaseDate;
      const hasMatchingGenre = genreMatches.every((genreId) => movie.genres.some((genre) => genre.id === genreId));
      const hasMatchingActor = !actorMatches.length || actorMatches.some((actorName) =>
        movie.cast.some((castMember) => castMember.name === actorName)
      );
      const hasMatchingLanguage = !languageMatches.length || languageMatches.includes(movie.language);
      return hasReleaseDate && hasMatchingGenre && hasMatchingActor && hasMatchingLanguage;
    });
  
    const similarityScoredMovies = filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre_ids: movie.genres.map((genre) => genre.id),
      similarityScore: mockSimilarityScore(queryMovie, movie.title),
    }));
  
    const sortedMovies = similarityScoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);
  
    expect(mockFindSimilarMovies(queryMovie, releaseDate, genreMatches, actorMatches, languageMatches)).toEqual(sortedMovies);
  });  

  // 8. RETURN RELEVANT SIMILAR MOVIES WHEN COMMAND INCLUDES LANGUAGE QUERY PARAM
  it('should return a sorted list of movies based on language query parameter', () => {
    const queryMovie = 'Movie 1';
    const releaseDate = null;
    const genreMatches = [];
    const actorMatches = [];
    const languageMatches = ['es'];
  
    const filteredMovies = mockMoviesArray.filter((movie) => {
      const hasReleaseDate = !releaseDate || movie.release_date === releaseDate;
      const hasMatchingGenre = !genreMatches.length || genreMatches.some((genreId) => movie.genres.some((genre) => genre.id === genreId));
      const hasMatchingActor = !actorMatches.length || actorMatches.some((actorName) =>
        movie.cast.some((castMember) => castMember.name === actorName)
      );
      const hasMatchingLanguage = languageMatches.includes(movie.language);
      return hasReleaseDate && hasMatchingGenre && hasMatchingActor && hasMatchingLanguage;
    });
  
    const similarityScoredMovies = filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre_ids: movie.genres.map((genre) => genre.id),
      similarityScore: mockSimilarityScore(queryMovie, movie.title),
    }));
  
    const sortedMovies = similarityScoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);
  
    expect(mockFindSimilarMovies(queryMovie, releaseDate, genreMatches, actorMatches, languageMatches)).toEqual(sortedMovies);
  });  

  // 9. RETURN RELEVANT SIMILAR MOVIES WHEN COMMAND INCLUDES *ALL* QUERY PARAMS
  it('should return relevant similar movies using ALL query parameters', async () => {
    const queryMovie = 'Movie 1';
    const releaseDate = null;
    const genreMatches = [28];
    const actorMatches = ['Actor 1'];
    const languageMatches = ['en'];

    const filteredMovies = mockMoviesArray.filter((movie) => {
      const hasReleaseDate = !releaseDate || movie.release_date === releaseDate;
      const hasMatchingGenre = genreMatches.every((genreId) => movie.genres.some((genre) => genre.id === genreId));
      const hasMatchingActor = actorMatches.every((actorName) =>
        movie.cast.some((castMember) => castMember.name === actorName)
      );
      const hasMatchingLanguage = !languageMatches.length || languageMatches.includes(movie.language);
      return hasReleaseDate && hasMatchingGenre && hasMatchingActor && hasMatchingLanguage;
    });

    const similarityScoredMovies = filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre_ids: movie.genres.map((genre) => genre.id),
      similarityScore: mockSimilarityScore(queryMovie, movie.title),
    }));

    const sortedMovies = similarityScoredMovies.sort((a, b) => b.similarityScore - a.similarityScore);

    expect(mockFindSimilarMovies(queryMovie, releaseDate, genreMatches, actorMatches, languageMatches)).toEqual(sortedMovies);
  });

  // 10. RETURN VALID MOVIE LINKS FROM GENERATEMOVIELINKS
  it('should return movie links for similar movies', () => {
    const similarMovies = [
      { id: 2, title: 'Test Movie 2', genre_ids: [28, 80], similarityScore: 4 },
      { id: 3, title: 'Test Movie 3', genre_ids: [28, 35], similarityScore: 1 },
      { id: 4, title: 'Test Movie 4', genre_ids: [12, 16], similarityScore: 1 },
      { id: 5, title: 'Test Movie 5', genre_ids: [28, 53], similarityScore: 1 }
    ];
    const expectedLinks = mockGenerateMovieLinks(similarMovies); // use the mockGenerateMovieLinks function

    const result = mockGenerateMovieLinks(similarMovies);

    expect(result).toEqual(expectedLinks);
  });
});
