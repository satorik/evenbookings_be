import React from 'react';
import BookingItem from '../BookingItem/BookingItem';
import './BookingList.css';

const BookingList = (props) => {
  console.log(props.bookings);
  return (
    <ul className="bookings__list">
    {props.bookings.map(booking => 
    <BookingItem 
      key = {booking._id}
      bookingId = {booking._id}
      eventTitle = {booking.event.title}
      eventDate = {booking.createdAt}
      onCancel = {props.onBookingCancel}
    /> )}
    </ul>
  )
}

export default BookingList;
