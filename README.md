# MoviesLike Bot Documentation

 The MoviesLike bot is designed to help you find similar movies to a given movie based on various criteria such as actors, genres, language, and sort by options. You can use the bot by calling the findSimilarMovies function with the required movie information and optional search criteria.
<br>

## Parameters

__queryMovie__ (required): An object representing the movie for which you want to find similar movies. 
<br> It needs to have the following properties to deliver a proper response:

  - `title`: The title of the movie is extracted from the !movieslike command, for example: `!movieslike Titanic`, we use a regular expression to extract the movie name Titanic.
  - `release_date`: The release date of the movie in the format YYYY-MM-DD. This is automatically returned inside of the TMDB movie object as a property, which we pull to calculate our range of allowed release dates to narrow the search results.
  - `genre_ids`: An array of genre IDs for the movie. We use our genre_ids as one part of the formula to calculate similarity. We query the TMDB API to find any movies which share the same genres as the query movie.

__queryMovieReleaseDate__ (optional): The release date of the query movie in the format YYYY-MM-DD. 
<br> This is used to filter through the TMDB API, pulling similar movies released within 40 years of the selected movie.

__options__ (optional): An object containing additional search criteria for finding similar movies.
  -  `actor`: An array of actor names pulled from the movie's credits.
  -  `genre`: An array of genre names used to filter by query.
  -  `language`: An array of languages to filter films by.
<br>

## Example Commands
- commands are not case sensitive! For example, "!movieslike Titanic" and !movieslike titanic" return the same results.

Search for similar movies to "The Shining" with actress "Shelley Duvall":

    !movieslike The Shining --actor=Shelley Duvall

Search for similar movies to "Osmosis Jones" with the genre "drama":

    !movieslike Osmosis Jones --genre=drama

Search for similar movies to "Avatar" with English language preference:

    !movieslike Avatar --language=en

Search for similar movies to "Inception" sorted by popularity:

    !movieslike Inception --sort_by=popularity.desc

Search for similar movies to "Goodfellas" with multiple genre filters:

    !movieslike "Goodfellas" --genre=drama --genre=crime

Search for similar movies to "Star Wars" with a combination of actors, genre, and language filters:

    !movieslike "Star Wars" --actor=Mark Hamill --actor=Harrison Ford --genre=sci-fi --language=en

<br>

# All movie data sourced from [The Movie Database](https://www.themoviedb.org/) API
