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
const ms = require('ms');
const cron = require('node-cron');

const app = express();

const db = mongoose.connect('mongodb://admin:Nettuno96@47.91.78.18:27017/anime9000?authSource=anime9000&readPreference=primary', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

global.connection = db.connection;

const scrap = cron.schedule('* */6 * * *', () => {
    scrapAnimeSaturn();
});

app.use('/static', express.static(__dirname + '/static'));

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    context: db.connection,
    graphiql: true,
}));

async function scrapAnimeSaturn() {
    const archive = await got('https://www.animesaturn.it/animelistold?load_all=1');
    const $ = cheerio.load(archive.body);
    var links = $('a');
    for (var link in links) {
        var animeLink = $(links[link]).attr('href');
        if (animeLink === undefined) continue;
        var page = await got(animeLink);
        var animePage = cheerio.load(page.body);
        let anime;
        let episodes = animePage('.bottone-ep');
        if (await Anime.exists({'title': animePage('img.img-fluid.cover-anime.rounded').attr('alt')})) {
            anime = await Anime.findOne({"title": animePage('img.img-fluid.cover-anime.rounded').attr('alt')});
            if (anime.episodes.length === episodes.length) continue;
        } else {
            anime = new Anime();
            anime.episodes = [];
        }
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
        if (!fs.existsSync('.' + anime.image)) {
            let response = await fetch(animePage('img.img-fluid.cover-anime.rounded').attr('src'));
            let buffer = await response.buffer();
            fs.writeFileSync('.' + anime.image, buffer);
        }
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
        if (!fs.existsSync('.' + anime.cover)) {
            let response = await fetch(animePage('img.img-fluid.cover-anime.rounded').attr('src'));
            let buffer = await response.buffer();
            fs.writeFileSync('.' + anime.cover, buffer);
        }
        var generi = animePage('.generi-as');
        anime.genre = [];
        generi.each(function (i, genere) {
            anime.genre.push(animePage(genere).text().replace('\t', '').replace('\n', ''));
        });
        for (let episode in episodes) {
            episode = parseInt(episode);
            if (isNaN(episode)) continue;
            if (episode < anime.episodes.length) continue;
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
            anime.episodes.push(ep);
        }
        anime.save();
    }
}

app.use('/', function (req, res, next) {
    res.send(process.env.PORT)
})

app.listen(process.env.PORT || 3333, function () {
    scrapAnimeSaturn();
    scrap.start();
});

module.exports = app;
