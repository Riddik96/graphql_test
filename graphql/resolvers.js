const mongoose = require('mongoose');
const animeModel = require('../models/anime');

module.exports = {
    hello: () => {
        return Math.random().toString(36).substring(7);
    },

    setMessage: ({message}) => {
        return message;
    },

    getAnime: () => {
        return animeModel.find({});
    },

    addAnime: ({anime}) => {
        animeDocument = new animeModel(anime);
        return animeDocument.save();
    }
};