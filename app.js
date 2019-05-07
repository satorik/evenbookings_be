const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const isAuth = require('./middleware/isAuth');
const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());
app.use(isAuth);

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-dvwiz.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => app.listen(3000))
  .catch(err => console.log(err));
