import React, { Component } from "react";
import "./signin.scss";
import {auth, signInWithGoogle, createUserProfileDoc} from "../../../firebase";
import DisplayErrors from "../../DisplayErrors";
import {withRouter, Link} from "react-router-dom";
import WithUser from "../../WithUser";

class SignIn extends Component {
  state = {
    email: "",
    password: "",
    loading: false,
    error: {
      status: false,
      type: null,
      message: null
    }
  };

  componentDidUpdate(prevProps) {
    if(prevProps.user !== this.props.user && this.props.user) {
      this.props.history.push("/")
    }
  }

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
          email: "",
          password: "",
          loading: false,
          error: {}
        });
        this.props.history.push("/profile")
        
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
      
      this.props.history.push("/profile")
      
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
    document.title = "Post It! | Signin"
    const { email, password, error, loading } = this.state;

    return (
      <div className="signin-form-container">
        <div className="signin-form generic-wrapper">
          <DisplayErrors error={error} />
          <div className="signin-form__form-wrapper">
            <form onSubmit={this.handleSubmit}>
              <h2>Signin</h2>
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
              <button disabled={error.status || loading}>
                {loading ? "Submiting..." : "Signin"}
              </button>
            </form>
            <div className="signin-form__google">
              <p>Or signin with <strong>Google</strong></p>
              <button disabled={error.status || loading} onClick={this.handleGoogleSignin}>
                <span><i className="fab fa-google"></i></span> {loading ? "Submiting..." : "Google"}
              </button>
            </div>
            <p style={{margin: 0, textAlign: "center"}}>Don't have an account? <Link to="/signup">Signup</Link> </p>
          </div>
        </div>
      </div>
    )
  }
}

export default WithUser(withRouter(SignIn));

