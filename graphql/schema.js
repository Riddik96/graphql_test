var {buildSchema} = require('graphql');

module.exports = buildSchema(`

  type Episode {
    title: String
    desctiption: String
    number: Int
    season: Int
    video: [String]
  }

  type Anime {
    title: String
    description: String
    image: String
    episodes: [Episode]
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
  }
`);