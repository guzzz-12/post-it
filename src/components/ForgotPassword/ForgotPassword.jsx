import React, { Component } from "react";
import "./forgotPassword.scss";
import {auth} from "../../firebase";
import DisplayErrors from "../DisplayErrors";
import WithUser from "../WithUser";

class ForgotPassword extends Component {
  state = {
    email: "",
    loading: false,
    success: false,
    error: {
      status: false,
      type: null,
      message: null
    }
  };

  componentDidMount(prevProps) {
    if(this.props.user) {
      this.props.history.push("/")
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  // Funcionalidad para enviar el email de reseteo de contraseña
  handleSubmit = async (e) => {
    e.preventDefault();

    if(this.isFormValid(this.state.email)) {
      try {
        this.setState({
          loading: true
        })

        // Enviar el email si la información ingresada es correcta
        await auth.sendPasswordResetEmail(this.state.email, {url: "https://think-piece-ad813.firebaseapp.com/"})

        // Notificar al usuario si la operación fue exitosa
        this.setState({
          loading: false,
          success: true
        }, () => setTimeout(() => {this.setState({success: false})}, 5000))

      } catch (error) {
        console.log(error)
        this.setState({
          loading: false,
          success: false,
          error: {
            status: true,
            type: "submit",
            message: error.message
          }
        }, () => this.clearErrorMessage())
      }
    }
  }

  // Validar el formulario
  isFormValid = (email) => {
    if(email === "") {
      this.setState({
        error: {
          status: true,
          type: "email",
          message: "You must provide your email"
        }
      }, () => this.clearErrorMessage())
      return false
    }
    return true
  }

  // Limpiar mensajes de error
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
    document.title = "Post It! | Forgort password?"
    const { email, error, loading } = this.state;

    return (
      <div className="forgot-password-form-container">
        <DisplayErrors error={error} />
        <div className="forgot-password-form generic-wrapper">
          <div
            className={`${this.state.success ?
            "email-send-wrapper--on-success" :
            "email-send-wrapper--on-success email-send-wrapper--on-success-hidden"}`}
          >
            <i className="far fa-check-circle"></i>
            <div className="success-text">
              <h1>An email was sent with instructions to reset your password</h1>
              <h1>Check your inbox</h1>
            </div>
          </div>
          <div className="forgot-password-form__form-wrapper">
            <form onSubmit={this.handleSubmit}>
              <h2>Reset your password</h2>
              <input
                className={`${error.status ? "input-validation-error" : ""}`}
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={this.handleChange}
              />
              <button disabled={error.status || loading}>
                {loading ? "Submiting..." : "Reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default WithUser(ForgotPassword);
