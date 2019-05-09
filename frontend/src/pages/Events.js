import React, { Component } from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import Spinner from '../components/Spinner/Spinner';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/Events/EventList/EventList';

export default class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    loading: false,
    selectedEvent: null
  }

  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.priceRef = React.createRef();
    this.dateRef = React.createRef();
    this.descriptionRef = React.createRef();
  }

  componentDidMount() {
    console.log('Component Did Mount');
    this.fetchEvents();
    console.log(this.state.events);
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true })
  }

  modalConfirmHandler = async () => {
    const title = this.titleRef.current.value;
    const price = +this.priceRef.current.value;
    const date = this.dateRef.current.value;
    const description = this.descriptionRef.current.value;

    if (title.trim().length === 0
      || price < 0
      || date.trim().length === 0
      || description.trim().length === 0) { return; }

    const event = { title, price, date, description };
    console.log(event);

    const requestBody = {
      query: `
      mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
        createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
          _id
          title
          description
          date
          price
        }
      }      
    `,
      variables: {
        title: title,
        price: price,
        date: date,
        description: description
      }
    }

    const token = this.context.token;
    console.log(token);
    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }

      const resData = await res.json();
      const eventData = resData.data.createEvent;

      if (eventData) {
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: eventData._id,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            price: eventData.price,
            creator: {
              _id: this.context.userId
            }
          });
          return {
            events: updatedEvents
          }
        })
      }

      this.setState({ creating: false })
    }
    catch (err) {
      console.log(err);
    }
  }

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null })
  }

  fetchEvents = async () => {
    this.setState({ loading: true });

    const requestBody = {
      query: `
      query {
        events {
          _id
          title
          description
          date
          price
          creator {
            _id
            email
          }
        }
      }      
    `
    }

    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }

      const resData = await res.json();
      const eventData = resData.data.events;

      if (eventData && this.isActive) {
        this.setState({
          events: eventData,
          loading: false
        });
      }
    }
    catch (err) {
      if (this.isActive) {
        this.setState({ loading: false });
      }
      console.log(err);
    }
  }

  showDetailHandler = eventId => {
    console.log(eventId);
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      console.log(selectedEvent);
      return { selectedEvent: selectedEvent }
    });
  }

  bookEventHandler = async () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }

    const requestBody = {
      query: `
      mutation BookEvent($eventId: ID!) {
        bookEvent(eventId: $eventId) {
          _id
          createdAt
          updatedAt
        }
      }      
    `,
      variables: {
        eventId: this.state.selectedEvent._id
      }
    }

    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.context.token
        }
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }

      const resData = await res.json();
      const bookingData = resData.data.bookEvent;

      if (bookingData) {
        console.log(bookingData);
        this.setState({ selectedEvent: null });
      }
    }
    catch (err) {
      this.setState({ selectedEvent: null });
      console.log(err);
    }
  }

  componentWillUnmount() {
    this.isActive = false;
  }


  render() {
    return (
      <>
        {this.state.creating &&
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="title" ref={this.priceRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="title" ref={this.dateRef} />
              </div>
              <div className="form-control">
                <label htmlFor="desctiption">Description</label>
                <textarea id="desctiption" rows="4" ref={this.descriptionRef}></textarea>
              </div>
            </form>
          </Modal>}
        {this.state.selectedEvent &&
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        }


        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.context.token && (<div className="events-control">
          <p>Create your own event!</p>
          <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
        </div>)}
        {this.state.loading ?
          <Spinner /> :
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />}
      </>
    );
  }
}
