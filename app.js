const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const mongoose = require('mongoose');

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

    app.listen(process.env.PORT || 8080);

});

module.exports = app;
