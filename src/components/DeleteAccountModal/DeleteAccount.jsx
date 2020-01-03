import React, {useState} from "react";
import {auth} from "../../firebase";
import bcryptjs from "bcryptjs"
import firebase from "../../firebase";
import Spinner from "../Spinner/Spinner";
import "./deleteAccount.scss";
import DisplayErrors from "../DisplayErrors";
import WithUser from "../WithUser";

const ConfirmModal = (props) => {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({
    status: false,
    type: null,
    message: null
  })

  const deleteHandler = async (data) => {
    const user = auth.currentUser;
    
    if(isFormValid(data)) {
      try {
        setLoading(true)
        
        // Borrar cuentas de usuarios autenticados con Google Provider
        if(user.providerData[0].providerId === "google.com") {
          const userSecurityPassword = props.user.securityPassword;
          const check = await bcryptjs.compare(password, userSecurityPassword);

          if(check) {
            user.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider())
            .then((credential) => {
              props.action(auth.currentUser.uid)
              setLoading(false)
              hideModalHandler()
            })
            .catch(() => {
              console.log(error)
              setLoading(false)
              setError({
                status: true,
                type: "submit",
                message: error.message
              })
              hideModalHandler()
              clearErrorMessage()
            })
          } else {
            window.scrollTo({top: 0});
            setLoading(false)
            setError({
              status: true,
              type: "submit",
              message: "Wrong security password"
            })
            hideModalHandler()
            clearErrorMessage()
          }

          // Borrar cuentas de usuarios autenticados con email/password
        } else {
          const credential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, data.password)
          await user.reauthenticateWithCredential(credential)
          props.action(auth.currentUser.uid)
          setLoading(false)
          hideModalHandler()
        }

      } catch (error) {
        console.log(error)
        window.scrollTo({top: 0});
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
    if(data.password === "") {
      setError({
        status: true,
        type: "password"
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
    setPassword("")
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
              <form onSubmit={(e) => e.preventDefault()} className="delete-account-modal__form">
                <input
                  className={`${error.type === "password" ? "input-validation-error" : ""}`}
                  type="password"
                  name="password"
                  onChange={onChangeHandler}
                  value={password}
                  placeholder={`${
                    error.type === "password" ?
                    "You must provide your password" :
                    auth.currentUser && auth.currentUser.providerData[0].providerId === "google.com" ?
                    "Your security password" :
                    "Your password"}`
                  }
                />
              </form>
              <div className="modal__buttons">
                <button onClick={() => deleteHandler({password})}>OK</button>
                <button onClick={() => hideModalHandler()}>Cancel</button>
              </div>
            </div>    
          </div>    
        </div>
      }
    </React.Fragment>
  );
}

export default WithUser(ConfirmModal);