import React, {useState} from "react";
import {auth} from "../firebase";

const EmailVerificationWarning = (props) => {
  const [message, setMessage] = useState(null);

  const sendVerification = () => {
    if(auth.currentUser) {
      auth.currentUser.sendEmailVerification({url: "http://localhost:3000/"})
      .then(() => {
        setMessage("Email verification sent, please check your inbox")
        setTimeout(() => {
          setMessage(null)
        }, 3500)
      })
      .catch((error) => {
        setMessage(error.message)
      })
    }
  }

  return (
    <div
      className={`${props.user && !props.user.emailVerified ?
      "email-warning"
      :
      "email-warning email-warning--hidden"}`}
    >
      {props.user && !props.user.emailVerified && message &&
        <h3>{message}</h3>
      }
      {props.user && !props.user.emailVerified && !message &&
        <React.Fragment>
          <p>You need to verify your email in order to create posts</p>
          <p>Check your inbox or <span onClick={sendVerification}>Send email verification again</span> </p>
        </React.Fragment>
      }
    </div>
  );
}

export default EmailVerificationWarning;
