const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const mongoose = require('mongoose');
const app = express();
const db = mongoose.connect('mongodb+srv://animeAdmin:animeAdmin9000@cluster0.bqbxg.gcp.mongodb.net/anime9000?retryWrites=true&w=majority')
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
}));

app.listen(process.env.PORT || 3000);

module.exports = app;
