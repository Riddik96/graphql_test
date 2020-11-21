const mongoose = require('mongoose');

const Episode = new mongoose.Schema({
    title: String,
    video: [String],
    number: Number,
});

const animeSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    cover: String,
    genre: [String],
    episodes: [Episode]
});

module.exports = mongoose.model('anime', animeSchema, 'anime');