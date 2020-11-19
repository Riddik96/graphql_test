const express = require('express');
var {graphqlHTTP} = require('express-graphql');
var {buildSchema} = require('graphql');

var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
    hello: () => {
        return 'Hello world!';
    },
};

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.use('/api/graph', graphqlHTTP({}));

app.listen(process.env.PORT || 3000);

module.exports = app;
