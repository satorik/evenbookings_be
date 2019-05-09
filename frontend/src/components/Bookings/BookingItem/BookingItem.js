import React from 'react';
import './BookingItem.css';

const BookingItem = (props) => {
  return (
    <li className="booking__list-item">
      <div className="booking__item-data">
        {props.eventTitle} - {new Date(props.eventDate).toLocaleDateString()}
      </div>
      <div className="booking__item-actions">
        <button className="btn" onClick={() => props.onCancel(props.bookingId)}>Cancel</button>
      </div>
    </li>
  )
}

export default BookingItem
