const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../utils/date');

const eventsRecursive = async eventsIds => {
  try {
    const events = await Event.find({_id: {$in: eventsIds}});
    if (!events) {
      throw new Error('Could not fetch events');
    }
    return events.map(event => {
      return transformEvent(event);
    });
  }
  catch (err) {
    throw err;
  }

}

const userRecursive = async userId => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User doesnt exist');
    }
    return {
      ...user._doc,
       _id: user.id, 
       createdEvents: eventsRecursive.bind(this, user.createdEvents)}
  }
  catch (err) {
    throw err;
  }
}

const singleEventRecursive = async eventId => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
     throw new Error('Could not find an event'); 
    }
    return transformEvent(event);

  } catch(err) {
    throw err;
  }
}

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event.date),
    creator: userRecursive.bind(this, event._doc.creator)
  }
}

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id.toString(),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt),
    user: userRecursive.bind(this, booking.user),
    event: singleEventRecursive.bind(this, booking.event)
  }

}


//exports.userRecursive = userRecursive;
//exports.eventsRecursive = eventsRecursive;
//exports.singleEventRecursive = singleEventRecursive;

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;