import React, {Component} from 'react';
import './Auth.css';

import AuthContext from '../context/auth-context';

export default class AuthPage extends Component {

  state = {
    isLogin: true
  }

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState((prevState) => {return {isLogin: !prevState.isLogin}});
  }

  submitHandler = async (event) => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }
    console.log(email, password);

    let requestBody = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        } 
      `
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
        mutation {
          createUser(userInput: {email: "${email}", password: "${password}"}) {
            _id
            email
          }
        }      
      `,
        variables: {
          email: email,
          password: password
        }
      }
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
      const loginData = resData.data.login;

      if (loginData.token) {
        this.context.login(loginData.token, loginData.userId, loginData.tokenExpiration);
      }

    }
    catch (err) {
      console.log(err);
    }
  }


  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" ref={this.passwordEl} />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'SignUp' : 'Login'}</button>
        </div>
      </form>
    );
  }
}
