import React, { Component } from 'react';
import  {signInWithGoogle, auth, createUserProfileDoc} from "../firebase";
import DisplayErrors from './DisplayErrors';
import {withRouter} from "react-router-dom";

class SignIn extends Component {
  state = {
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

    this.setState({ [name]: value, error: {} });
  };

  handleSubmit= async (event) => {
    event.preventDefault();

    if(this.isFormValid(this.state)) {
      this.setState({
        loading: true
      })

      try {
        await auth.signInWithEmailAndPassword(this.state.email, this.state.password)
        this.setState({
          email: '',
          password: '',
          loading: false,
          error: {}
        });
        
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

  handleGoogleSignin = async () => {
    this.setState({
      loading: true
    })

    try {
      // Logueare con google
      const user = await signInWithGoogle();

      // Crear el perfil del usuario si no existe
      await createUserProfileDoc(user.user)

      this.setState({
        loading: false
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
      return;
    }
  };

  isFormValid = (data) => {
    if(data.email === "" && data.password === "") {
      this.setState({
        error: {
          status: true,
          type: "emptyFields",
          message: "You must complete all fields"
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
    const { email, password, error, loading } = this.state;

    return (
      <div className="SignIn" style={{position: "relative", overflow: "hidden"}}>
        <DisplayErrors error={error} />
        <form onSubmit={this.handleSubmit}>
          <h2>Sign In</h2>
          <input
            className={`${error.status ? "input-validation-error" : ""}`}
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.handleChange}
          />
          <input
            className={`${error.status ? "input-validation-error" : ""}`}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={this.handleChange}
          />
          <button disabled={error.status || loading} style={{marginBottom: "10px"}}>
            {loading ? "Submiting..." : "Sign In"}
          </button>
        </form>
        <button disabled={error.status || loading} onClick={this.handleGoogleSignin}>
          {loading ? "Submiting..." : "Sign In With Google"}
        </button>
      </div>
    );
  }
}

export default withRouter(SignIn);
