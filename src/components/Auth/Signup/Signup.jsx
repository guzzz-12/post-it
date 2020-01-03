import React, { Component } from "react";
import "./signup.scss";
import {auth, createUserProfileDoc, firestore} from "../../../firebase";
import DisplayErrors from "../../DisplayErrors";
import {withRouter, Link} from "react-router-dom";
import WithUser from "../../WithUser";

class SignUp extends Component {
  state = {
    displayName: "",
    email: "",
    password: "",
    passwordConfirm: "",
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

    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    if(this.isFormValid(this.state)) {
      this.setState({
        loading: true
      })

      try {
        
        // Crear cuenta del usuario
        const newUser = await auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
        
        //Actualizar datos de la cuenta del usuario
        await newUser.user.updateProfile({
          displayName: this.state.displayName,
          photoURL: "/img/default-user.png"
        })
        
        // Crear perfil del usuario o actualizarlo si ya existe
        const userDocRef = await firestore.collection("users").doc(newUser.user.uid).get()

        if(userDocRef.exists && !userDocRef.data().displayName) {
          userDocRef.ref.update({displayName: newUser.user.displayName, photoURL: newUser.user.photoURL})
          this.props.history.push("/profile")
        } else if(!userDocRef) {
          await createUserProfileDoc(newUser.user)
          this.props.history.push("/profile")
        }

        // Enviar email de verificación de cuenta
        this.sendVerification(newUser.user)

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
        console.log(error)
      }
    }
  };

  sendVerification = (user) => {
    user.sendEmailVerification({url: "https://think-piece-ad813.firebaseapp.com/"})
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
    } else if(data.passwordConfirm !== data.password) {
      this.setState({
        error: {
          status: true,
          type: "password",
          message: "Passwords don't match."
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
    document.title = "Post It! | Signup"
    const { displayName, email, password, passwordConfirm, error, loading } = this.state;

    return (
      <div className="signup-form-container">
        <DisplayErrors error={error} />
        <div className="signup-form">
          <form
            onSubmit={this.handleSubmit}
            style={{overflow: "hidden"}}
          >
            <h2>Sign Up</h2>
            <input
              type="text"
              name="displayName"
              className={`${error.status ? "input-validation-error" : ""}`}
              placeholder="Name"
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
              type="password"
              name="passwordConfirm"
              className={`${error.status ? "input-validation-error" : ""}`}
              placeholder="Confirm your password"
              value={passwordConfirm}
              onChange={this.handleChange}
            />
            <input
              disabled={error.status || loading}
              type="submit"
              value={loading ? "Submitting..." : "Signup"}
            />
          </form>
          <p style={{margin: 0, textAlign: "center"}}>Already a member? <Link to="/signin">Signin</Link> </p>  
        </div>
      </div>
    );
  }
}

export default WithUser(withRouter(SignUp));
