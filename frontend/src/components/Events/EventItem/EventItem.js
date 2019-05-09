import React from 'react';
import './EventItem.css';

const EventItem = props =>  (
      <li className="event__list-item">
        <div>
          <h1>{props.title}</h1>
          <h2>${props.price} - {new Date(props.date).toLocaleDateString()}</h2>
        </div>
        <div>
          {!props.isAuthor && <button className="btn" onClick={props.onDetail.bind(this, props.eventId)}>Veiw Details</button>}
          {props.isAuthor && <p>You are the owner of the event</p>}
        </div>
      
      </li>
  );

export default EventItem;
