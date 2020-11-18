const express = require('express');
const graphqlHTTP = require('express-graphql');
const app = express();

app.use('/api/graph', graphqlHTTP({}));

app.listen(process.env.PORT || 3000);

module.exports = app;
