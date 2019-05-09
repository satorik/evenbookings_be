import React, {Component} from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';

export default class EventsPage extends Component {
  state = {
    creating: false
  }

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.priceRef = React.createRef();
    this.dateRef = React.createRef();
    this.descriptionRef = React.createRef();
  }

  startCreateEventHandler = () => {
    this.setState({creating: true})
  }

  modalConfirmHandler = async () => {
    const title = this.titleRef.current.value;
    const price = +this.priceRef.current.value;
    const date = this.dateRef.current.value;
    const description = this.descriptionRef.current.value;

    if (title.trim().length === 0
      || price < 0
      || date.trim().length === 0
      || description.trim().length === 0) {return;}

    const event = {title, price, date, description};
    console.log(event);

    const requestBody = {
      query: `
      mutation {
        createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date:"${date}"}) {
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
        console.log(eventData);
      }

    }
    catch (err) {
      console.log(err);
    }
  }

  modalCancelHandler = () => {
    this.setState({creating: false})
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
        {this.state.creating && <Backdrop />}
        <div className="events-control">
          <p>Create your own event!</p>
          <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
        </div>
      </>
    );
  }
}
