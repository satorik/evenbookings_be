const Event = require("../../models/event");
const User = require('../../models/user');

const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {return transformEvent(event)});
    }
    catch (err) {
      throw err;
    }
  },

  createEvent: async (args, req) => {
    console.log('hello');
    if (!req.isAuth) {
      throw new Error('Not authanticated!');
    }
    try {
      const event = await new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: req.userId
      }).save();

      const user = await User.findById(req.userId);
    
      if (!user) {
        throw new Error("User doesn't exist");
      }
      user.createdEvents.push(event);
      await user.save();

      return transformEvent(event);

    } catch (err) {
      throw err;
    }
  }
}
