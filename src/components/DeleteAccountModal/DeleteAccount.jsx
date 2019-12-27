import React, {useState} from "react";
import {auth} from "../../firebase";
import firebase from "../../firebase";
import Spinner from "../Spinner/Spinner";
import "./deleteAccount.scss";
import DisplayErrors from "../DisplayErrors";

const ConfirmModal = (props) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({
    status: false,
    type: null,
    message: null
  })

  const deleteHandler = async (data) => {
    const user = auth.currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(data.email, data.password)
    
    if(isFormValid(data)) {
      try {
        setLoading(true)
        
        if(user.providerData[0].providerId === "google.com") {
          throw new Error("Funcionalidad para borrar usuarios de google aún no terminada")
        } else {
          await user.reauthenticateWithCredential(credential)
        }  

        props.action(auth.currentUser.uid)

        setLoading(false)
        hideModalHandler()
        
      } catch (error) {
        console.log(error)
        setLoading(false)
        setError({
          status: true,
          type: "submit",
          message: error.message
        })
        hideModalHandler()
        clearErrorMessage()
      }
    }
  }

  const isFormValid = (data) => {
    if(data.email === "" && data.password === "") {
      setError({
        status: true,
        type: "emptyFields",
        // message: "You must provide your email"
      })
        
      return false

    } else if(data.email === "") {
        setError({
          status: true,
          type: "email",
          message: "You must provide your email"
        })

      return false

    } else if(data.password === "") {
        setError({
          status: true,
          type: "password",
          message: "You must provide your password"
        })
        
      return false
    }
    return true
  }

  const onChangeHandler = (e) => {    
    setError({
      status: false,
      type: null,
      message: null
    })
    
    if(e.target.name === "email") {
      setEmail(e.target.value)
    }
    
    if(e.target.name === "password") {
      setPassword(e.target.value)
    }
  }

  const clearErrorMessage = () => {
    setTimeout(() => {
      setError({
        ...error,
        status: false
      })
    }, 3500)
  }

  const hideModalHandler = () => {
    props.hide()
  }

  return (
    <React.Fragment>
      {error.type === "submit" && <DisplayErrors error={error} />}
      {props.show &&
        <div className="delete-account-modal__wrapper" style={{position: "relative"}}>
          <div className="delete-account-modal">
            {loading && <Spinner />}
            <div className="delete-account-modal__content">
              <h1>Confirm account deletion</h1>
              <form className="delete-account-modal__form">
                <input
                  className={`${error.type === "email" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
                  type="email"
                  name="email"
                  onChange={onChangeHandler}
                  value={email}
                  placeholder={`${error.type === "email" || error.type === "emptyFields" ? "You must provide your email" : "Your email"}`}
                />
                <input
                  className={`${error.type === "password" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
                  type="password"
                  name="password"
                  onChange={onChangeHandler}
                  value={password}
                  placeholder={`${error.type === "password" || error.type === "emptyFields" ? "You must provide your password" : "Your password"}`}
                />
              </form>
              <div className="modal__buttons">
                <button onClick={() => deleteHandler({email, password})}>OK</button>
                <button onClick={() => hideModalHandler()}>Cancel</button>
              </div>
            </div>    
          </div>    
        </div>
      }
    </React.Fragment>
  );
}

export default ConfirmModal;