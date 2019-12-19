import React, { Component } from 'react';
import  {signInWithGoogle, auth} from "../firebase";
import DisplayErrors from './DisplayErrors';

class SignIn extends Component {
  state = {
    email: '',
    password: '',
    error: {}
  };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ [name]: value, error: {} });
  };

  handleSubmit= async (event) => {
    event.preventDefault();

    if(this.isFormValid(this.state)) {
      try {
        await auth.signInWithEmailAndPassword(this.state.email, this.state.password)
        this.setState({ email: '', password: '', error: {} });
        
      } catch (error) {
        this.setState({
          error: {
            type: "submit",
            message: error.message
          }
        }, () => this.clearErrorMessage())
        console.log(error)
      }
    }
  };

  handleGoogleSignin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      this.setState({
        error: {
          type: "submit",
          message: "Error submiting, please try again."
        }
      }, () => this.clearErrorMessage())
      console.log(error.message)
    }
  };

  isFormValid = (data) => {
    if(data.email === "" && data.password === "") {
      this.setState({
        error: {
          type: "emptyFields",
          message: "You must complete all fields"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.email === "") {
      this.setState({
        error: {
          type: "email",
          message: "You must provide a valid email"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.password === "") {
      this.setState({
        error: {
          type: "password",
          message: "You must provide the password"
        }
      }, () => this.clearErrorMessage())
      return false
    }
    return true
  }

  clearErrorMessage = () => {
    setTimeout(() => {
      this.setState({
        error: {}
      })
    }, 3900)
  }

  render() {
    const { email, password, error } = this.state;

    return (
      <div className="SignIn">
        <DisplayErrors error={error.message} />
        <form onSubmit={this.handleSubmit}>
          <h2>Sign In</h2>
          <input
            className={`${error.type === "email" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.handleChange}
          />
          <input
            className={`${error.type === "password" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={this.handleChange}
          />
          <button disabled={error.message} style={{marginBottom: "10px"}}>Sign In</button>
        </form>
        <button onClick={this.handleGoogleSignin}>Sign In With Google</button>
      </div>
    );
  }
}

export default SignIn;
