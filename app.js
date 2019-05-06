const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: ID!
    }
    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    input UserInput {
      email: String!
      password: String!
    }
    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput!): Event!
      createUser(userInput: UserInput) : User!
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: async function() {
        const events = await Event.find();
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id
          };
        });
      },
      createEvent: async function(args) {
        try {
          const event = await new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5ccf43c738eb15054c892e12"
          }).save();

          let user = await User.findById("5ccf43c738eb15054c892e12");
          if (!user) {
            throw new Error("User already exists");
          }
          await user.createdEvents.push(event);
          await user.save();

          return { ...event._doc, _id: event.id };
        } catch (err) {
          console.log(err);
        }
      },
      createUser: async function(args) {
        let user = await User.findOne({ email: args.userInput.email });
        if (user) {
          throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

        try {
          user = await new User({
            email: args.userInput.email,
            password: hashedPassword
          }).save();
        } catch (err) {
          console.log(err);
        }
        return { ...user._doc, _id: user.id, password: null };
      }
    },
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
