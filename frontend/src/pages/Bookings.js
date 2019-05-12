import React, { Component } from 'react';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls';

export default class BookingsPage extends Component {
  state = {
    loading: false,
    bookings: [],
    outputType: 'list'
  }
  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = async () => {
    this.setState({ loading: true });

    const requestBody = {
      query: `
      query {
        bookings {
          _id
          createdAt
          event {
            _id
            title
            price
            date
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
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.context.token
        }
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }

      const resData = await res.json();
      const bookingData = resData.data.bookings;

      if (bookingData) {
        this.setState({
          bookings: bookingData,
          loading: false
        });
      }
    }
    catch (err) {
      this.setState({ loading: false });
      console.log(err);
    }
  }

  bookingCancelHandler = async (bookingId) => {
    this.setState({ loading: true });
    const requestBody = {
      query: `
      mutation CancelBooking($bookingId: ID!) {
        cancelBooking(bookingId: $bookingId) {
          _id
          title
          date
        }
      }      
    `,
      variables: {
        bookingId: bookingId
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
      const eventData = resData.data.cancelBooking;

      if (eventData) {
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(booking => booking._id !== bookingId);
          return {
            bookings: updatedBookings,
            loading: false
          }
        });
      }
    }
    catch (err) {
      this.setState({ loading: false });
      console.log(err);
    }
  }

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({outputType: 'list'});
    } else {
      this.setState({outputType: 'chart'});
    }
  }

  render() {
    let content = <Spinner />;
    if (!this.state.loading) {
      content = (
        <>
          <BookingsControls activeType={this.state.outputType} onChange={this.changeOutputTypeHandler}/>
          <div>
            {this.state.outputType === 'list' ? 
            <BookingList bookings={this.state.bookings} onBookingCancel={this.bookingCancelHandler} /> :
            <BookingsChart bookings={this.state.bookings} />
            }
          </div>
        </>
      );
    }
    return <> {content} </>;
  }
}
