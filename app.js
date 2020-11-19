const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
}));

app.listen(process.env.PORT || 3000);

module.exports = app;
