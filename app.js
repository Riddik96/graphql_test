const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const mongoose = require('mongoose');
const Anime = require('./models/anime')
const got = require('got');
const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

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
        for (var link in links) {
            var animeLink = $(links[link]).attr('href');
            if (animeLink === undefined) continue;
            var page = await got(animeLink);
            var animePage = cheerio.load(page.body);
            var anime = new Anime();
            anime.title = animePage('img.img-fluid.cover-anime.rounded').attr('alt');
            anime.description = animePage('div#full-trama').text();
            anime.image = '/static/images/anime/' + Buffer.from(anime.title).toString('base64');
            if (animePage('img.img-fluid.cover-anime.rounded').attr('src').includes('.jpg')) {
                anime.image += '.jpg';
            } else if (animePage('img.img-fluid.cover-anime.rounded').attr('src').includes('.png')) {
                anime.image += '.png';
            } else if (animePage('img.img-fluid.cover-anime.rounded').attr('src').includes('.jpeg')) {
                anime.image += '.jpeg';
            }
            let response = await fetch(animePage('img.img-fluid.cover-anime.rounded').attr('src'));
            let buffer = await response.buffer();
            await fs.writeFile('.' + anime.image, buffer, () =>
                console.log('finished downloading!'));
            var cover = animePage('div#anime').find('div.banner').attr('style');
            var start = cover.indexOf('url(');
            var end = cover.indexOf("')");
            anime.cover = '/static/images/cover/' + Buffer.from(anime.title).toString('base64');
            if (cover.slice(start + 5, end).includes('.jpg')) {
                anime.cover += '.jpg';
            } else if (cover.slice(start + 5, end).includes('.png')) {
                anime.cover += '.png';
            } else if (cover.slice(start + 5, end).includes('.jpeg')) {
                anime.cover += '.jpeg';
            }
            response = await fetch(animePage('img.img-fluid.cover-anime.rounded').attr('src'));
            buffer = await response.buffer();
            await fs.writeFile('.' + anime.cover, buffer, () =>
                console.log('finished downloading!'));
            var generi = animePage('.generi-as');
            anime.genre = [];
            generi.each(function (i, genere) {
                anime.genre.push(animePage(genere).text().replace('\t', '').replace('\n', ''));
            });
            anime.episodes = [];
            let episodes = animePage('.bottone-ep');
            for (let episode in episodes) {
                episode = parseInt(episode);
                if (isNaN(episode)) continue;
                let ep = {};
                ep.title = animePage(episodes[episode]).text().replace('\n', '').trim().replace('\t', '');
                let link = animePage(episodes[episode]).attr('href');
                if (link === undefined) continue;
                let response = await got(link);
                let episodePage = cheerio.load(response.body);
                link = episodePage('a[href*=watch]').attr('href');
                ep.video = [];
                let variations = ['', '&extra=1', '&s=alt', '&s=alt&extra=1']
                for (let variation in variations) {
                    let source;
                    response = await got(link + variations[variation]);
                    episodePage = cheerio.load(response.body);
                    if (episodePage('video').attr('src') !== undefined) {
                        source = episodePage('video').attr('src')
                    } else if (episodePage('source').attr('src') !== undefined) {
                        source = episodePage('source').attr('src');
                    } else {
                        continue;
                    }
                    ep.video.push(source);
                }
                ep.number = ep.title.replace(/\D+/g, "");
                anime.episodes = ep;
            }
            console.log(anime.episodes)
        }
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
