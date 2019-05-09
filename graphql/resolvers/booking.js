const Event = require("../../models/event");
const Booking = require("../../models/booking");

const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not authanticated!');
    }
    try {
      const bookings = await Booking.find({user: req.userId});
      console.log(req.userId, bookings);
      return bookings.map(booking => {
        return transformBooking(booking);
      });

    }
    catch (err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not authanticated!');
    }
    try {
      const event = await Event.findById(args.eventId);
      const booking = await new Booking({
        user: req.userId,
        event: event
      }).save();
      return transformBooking(booking);
    }
    catch (err) {
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Not authanticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({_id: args.bookingId});
      return event;
    } catch(err) {
      throw err;
    }
  }
}