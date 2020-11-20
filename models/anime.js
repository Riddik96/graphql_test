const mongoose = require('mongoose');

const Episode = new mongoose.Schema({
    title: String,
    description: String,
    video: [String],
    number: Number,
    season: Number,
});

const animeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    cover: String,
    genre: [String],
    totalEpisodes: Number,
    seasons: Number,
    episodes: [Episode]
});

module.exports = mongoose.model('anime', animeSchema, 'anime');