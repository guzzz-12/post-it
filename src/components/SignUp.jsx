import React, { Component } from 'react';
import {auth, createUserProfileDoc} from "../firebase";
import md5 from "md5";
import DisplayErrors from './DisplayErrors';

class SignUp extends Component {
  state = {
    displayName: '',
    email: '',
    password: '',
    loading: false,
    error: {
      status: false,
      type: null,
      message: null
    }
  };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    if(this.isFormValid(this.state)) {
      this.setState({
        loading: true
      })

      try {
        let newUser = null;
        auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          createdUser.user.updateProfile({
            displayName: this.state.displayName,
            photoURL: `http://gravatar.com/avatar/${md5(this.state.email)}?d=identicon`
          })
          newUser = createdUser;
        })
        .then(() => {
          this.sendVerification(newUser.user)
          createUserProfileDoc(newUser.user)
          // .then(() => {
          //   this.setState({
          //     displayName: '',
          //     email: '',
          //     password: '',
          //     loading: false
          //   });
          // })
        })
        .catch((error) => {
          this.setState({
            loading: false,
            error: {
              status: true,
              type: "submit",
              message: error.message
            }
          }, () => this.clearErrorMessage())
          console.log(error)
        })  
      } catch (error) {
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "submit",
            message: error.message
          }
        }, () => this.clearErrorMessage())
        console.log(error)
      }
    }
  };

  sendVerification = (user) => {
    user.sendEmailVerification({url: "http://localhost:3000/"})
    .then(() => {
      console.log("Email verification sent, please check your inbox")
    })
    .catch((error) => {
      this.setState({
        error: {
          status: true,
          type: "emailSend",
          message: error.message
        }
      }, () => this.clearErrorMessage())
      console.log(error)
    })
  }

  isFormValid = (data) => {
    if(data.displayName === "" && data.email === "" && data.password === "") {
      this.setState({
        error: {
          status: true,
          type: "emptyFields",
          message: "You must complete all fields"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.displayName === "") {
      this.setState({
        error: {
          status: true,
          type: "displayName",
          message: "You must provide your username"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.email === "") {
      this.setState({
        error: {
          status: true,
          type: "email",
          message: "You must provide a valid email"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.password === "") {
      this.setState({
        error: {
          status: true,
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
        error: {
          ...this.state.error,
          status: false
        }
      })
    }, 3500)
  }

  render() {
    const { displayName, email, password, error, loading } = this.state;

    return (
      <form
        className="SignUp"
        onSubmit={this.handleSubmit}
        style={{position: "relative", overflow: "hidden"}}
      >
        <DisplayErrors error={error} />
        <h2>Sign Up</h2>
        <input
          type="text"
          name="displayName"
          className={`${error.status ? "input-validation-error" : ""}`}
          placeholder="Display Name"
          value={displayName}
          onChange={this.handleChange}
        />
        <input
          type="email"
          name="email"
          className={`${error.status ? "input-validation-error" : ""}`}
          placeholder="Email"
          value={email}
          onChange={this.handleChange}
        />
        <input
          type="password"
          name="password"
          className={`${error.status ? "input-validation-error" : ""}`}
          placeholder="Password"
          value={password}
          onChange={this.handleChange}
        />
        <input
          disabled={error.status || loading}
          type="submit"
          value={loading ? "Submitting..." : "Sign Up"}
        />
      </form>
    );
  }
}

export default SignUp;
