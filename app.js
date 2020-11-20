const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const mongoose = require('mongoose');
const Anime = require('./models/anime')
const got = require('got');
const cheerio = require('cheerio');

const app = express();
mongoose.connect('mongodb+srv://animeAdmin:animeAdmin9000@cluster0.bqbxg.gcp.mongodb.net/anime9000?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(db => {
    global.connection = db.connection;
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: resolvers,
        context: db.connection,
        graphiql: true,
    }));

    app.use('/scrap', async function (req, res, next) {
        const archive = await got('https://www.animesaturn.it/animelistold?load_all=1');
        const $ = cheerio.load(archive.body);
        var links = $('a');
        links.each(async function (index, link) {
            var animeLink = $(link).attr('href');
            var page = await got(animeLink);
            var animePage = cheerio.load(page.body);
            var anime = new Anime();
            anime.title = animePage('img.img-fluid.cover-anime.rounded').attr('alt');
            anime.image = animePage('img.img-fluid.cover-anime.rounded').attr('src');
            anime.description = animePage('div#full-trama').text();
            var cover = animePage('div#anime').find('div.banner').attr('style');
            var start = cover.indexOf('url(');
            var end = cover.indexOf("')");
            anime.cover = cover.slice(start + 5, end);
            var generi = animePage('.generi-as');
            anime.genre = [];
            generi.each(function (i, genere) {
                anime.genre.push(animePage(genere).text().replace('\t', '').replace('\n', ''));
            });
            console.log(anime)
            sleep(5000);
        });
    })

    app.listen(process.env.PORT || 8080);

});

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

module.exports = app;
