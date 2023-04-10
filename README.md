# MoviesLike Bot Documentation

 The MoviesLike bot is designed to help you find similar movies to a given movie based on various criteria such as actors, genres, language, and sort by options. You can use the bot by calling the findSimilarMovies function with the required movie information and optional search criteria.
<br>

## Parameters

__queryMovie__ (required): An object representing the movie for which you want to find similar movies. 
<br> It needs to have the following properties to deliver a proper response:

  - `title`: The title of the movie.
  - `release_date`: The release date of the movie in the format YYYY-MM-DD.
  - `genre_ids`: An array of genre IDs for the movie.

__queryMovieReleaseDate__ (optional): The release date of the query movie in the format YYYY-MM-DD. 
<br> This is used to filter through the TMDB API, pulling similar movies released within 40 years of the selected movie.

__options__ (optional): An object containing additional search criteria for finding similar movies.
  -  `actors`: An array of actor names to filter by.
  -  `genres`: An array of genre names to filter by.
  -  `language`: An array of language names to filter by.
  -  `sort_by`: A string representing the sorting criteria for the results.
<br>

## Example Commands

Search for similar movies to "Titanic" with the genre "drama":

    !movieslike Titanic --genre=drama

Search for similar movies to "Benchwarmers" with actor "Jon Heder":

    !movieslike Benchwarmers --actors=Jon Heder

Search for similar movies to "Avatar" with English language preference:

    !movieslike Avatar --language=en

Search for similar movies to "Inception" sorted by popularity:

    !movieslike Inception --sort_by=popularity.desc

Search for similar movies to "The Godfather" with multiple genre filters:

    !movieslike "The Godfather" --genre=drama --genre=crime

Search for similar movies to "Star Wars" with a combination of actors, genre, and language filters:

    !movieslike "Star Wars" --actors=Mark Hamill --actors=Harrison Ford --genre=sci-fi --language=en

<br>

## Function Signature 
<code>async function findSimilarMovies(queryMovie, queryMovieReleaseDate, options = {})</code>

# All movie data sourced from [The Movie Database](https://www.themoviedb.org/) API