import React, { Component } from 'react';
import  {signInWithGoogle, auth} from "../firebase";

class SignIn extends Component {
  state = { email: '', password: '' };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  handleSubmit= async (event) => {
    event.preventDefault();

    try {
      await auth.signInWithEmailAndPassword(this.state.email, this.state.password)
      console.log("Logged in successfully")
      this.setState({ email: '', password: '' });
      
    } catch (error) {
      console.log(error)
    }
  };

  handleGoogleSignin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.log(error.message)
    }
  }

  render() {
    const { email, password } = this.state;

    return (
      <div className="SignIn">
        <form onSubmit={this.handleSubmit}>
          <h2>Sign In</h2>
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
          <button style={{marginBottom: "10px"}}>Sign In</button>
        </form>
        <button onClick={this.handleGoogleSignin}>Sign In With Google</button>
      </div>
    );
  }
}

export default SignIn;
