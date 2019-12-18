import React, { Component } from 'react';
import {auth, createUserProfileDoc} from "../firebase";
import md5 from "md5";

class SignUp extends Component {
  state = {
    displayName: '',
    email: '',
    password: ''
  };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const newUser = await auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
      await newUser.user.updateProfile({
        displayName: this.state.displayName,
        photoURL: `http://gravatar.com/avatar/${md5(this.state.email)}?d=identicon`
      })
      
      auth.currentUser.sendEmailVerification({url: "http://localhost:3000/"})
      .then(() => {
        console.log("Email verification sent, please check your inbox")
      })
      .catch((err) => {
        console.log(err)
      })
      
      await createUserProfileDoc(newUser.user)

      this.setState({
        displayName: '',
        email: '',
        password: ''
      });

    } catch (error) {
      console.log(error)
    }
  };

  render() {
    const { displayName, email, password } = this.state;

    return (
      <form className="SignUp" onSubmit={this.handleSubmit}>
        <h2>Sign Up</h2>
        <input
          type="text"
          name="displayName"
          placeholder="Display Name"
          value={displayName}
          onChange={this.handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={this.handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={this.handleChange}
        />
        <input type="submit" value="Sign Up" />
      </form>
    );
  }
}

export default SignUp;
