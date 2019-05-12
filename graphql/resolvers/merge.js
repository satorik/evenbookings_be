const Event = require('../../models/event');
const User = require('../../models/user');
const DataLoader = require('dataloader');

const { dateToString } = require('../../utils/date');

const eventLoader = new DataLoader((eventIds) => {
  return eventsRecursive(eventIds);
});

const userLoader = new DataLoader( userIds => {
  return User.find({_id: {$in: userIds}});
});

const eventsRecursive = async eventsIds => {
  try {
    const events = await Event.find({_id: {$in: eventsIds}});
    events.sort((a,b) => {
      return (
        eventsIds.indexOf(a._id.toString()) - eventsIds.indexOf(b._id.toString())
        );
    });
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
    const user = await userLoader.load(userId.toString());
    if (!user) {
      throw new Error('User doesnt exist');
    }
    return {
      ...user._doc,
       _id: user.id, 
       createdEvents: () => eventLoader.loadMany(user.createdEvents)
      }
  }
  catch (err) {
    throw err;
  }
}

const singleEventRecursive = async eventId => {
  try {
    const event = await eventLoader.load(eventId.toString());
    if (!event) {
     throw new Error('Could not find an event'); 
    }
    return event;

  } catch(err) {
    throw err;
  }
}

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event.date),
    creator: userRecursive.bind(this, event.creator)
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