var {buildSchema} = require('graphql');

module.exports = buildSchema(`

  type Episode {
    _id: String
    title: String
    description: String
    number: Int
    season: Int
    video: [String]
  }
  
  input EpisodeInput {
    title: String
    description: String
    number: Int
    season: Int
    video: [String]
  }

  type Anime {
    _id: String
    title: String
    description: String
    image: String
    episodes: [Episode]
    genre: [String]
    totalEpisodes: Int
    seasons: Int
  }
  
  input AnimeInput  {
    title: String
    description: String
    image: String
    episodes: [EpisodeInput]
    genre: [String]
    totalEpisodes: Int
    seasons: Int
  }
  
  type Query {
    hello: String
    getAnime: [Anime]
  }
  
  type Mutation {
    setMessage(message: String): String
    addAnime(anime: AnimeInput): Anime
  }
  
`);