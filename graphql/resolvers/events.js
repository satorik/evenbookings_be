const Event = require("../../models/event");

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
    if (!req.isAuth) {
      throw new Error('Not authanticated!');
    }
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
      user.createdEvents.push(event);
      await user.save();

      return transformEvent(event);

    } catch (err) {
      throw err;
    }
  }
}
