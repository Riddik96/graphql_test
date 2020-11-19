const mongoose = require('mongoose');
const anime = require('../models/anime');

module.exports = {
    hello: () => {
        return Math.random().toString(36).substring(7);
    },

    setMessage: ({message}) => {
        return message;
    },

    getAnime: () => {
        anime.find({}, function (animeList) {
            return animeList;
        });
    }
};