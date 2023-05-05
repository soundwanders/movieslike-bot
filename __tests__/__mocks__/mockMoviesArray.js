const mockMoviesArray = [
  {
    id: 1,
    title: 'Movie 1',
    release_date: '2022-01-01',
    genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }],
    cast: [
      { id: 1, name: 'Actor 1', character: 'Character 1' },
      { id: 2, name: 'Actor 2', character: 'Character 2' }
    ],
    language: 'en',
    overview: 'Overview of Movie 1'
  },
  {
    id: 2,
    title: 'Movie 2',
    release_date: '2022-02-01',
    genres: [{ id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }],
    cast: [
      { id: 3, name: 'Actor 3', character: 'Character 3' },
      { id: 4, name: 'Actor 4', character: 'Character 4' }
    ],
    language: 'en',
    overview: 'Overview of Movie 2'
  },
  {
    id: 3,
    title: 'Movie 3',
    release_date: '2022-03-01',
    genres: [{ id: 10751, name: 'Family' }, { id: 16, name: 'Animation' }],
    cast: [
      { id: 5, name: 'Actor 5', character: 'Character 5' },
      { id: 6, name: 'Actor 6', character: 'Character 6' }
    ],
    language: 'en',
    overview: 'Overview of Movie 3'
  },
  {
    id: 4,
    title: 'Movie 4',
    release_date: '2022-04-01',
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 53, name: 'Thriller' }],
    cast: [
      { id: 7, name: 'Actor 7', character: 'Character 7' },
      { id: 8, name: 'Actor 8', character: 'Character 8' }
    ],
    language: 'en',
    overview: 'Overview of Movie 4'
  }
];

module.exports = {
  mockMoviesArray,
};
