import React from "react"

import SignIn from "./SignIn";
import SignUp from "./SignUp";
import WithUser from "./WithUser";
import {withRouter} from "react-router-dom";

const SignInAndSignUp = (props) => {
  if(!props.user) {
    return (
      <div className="generic-wrapper">
        <SignIn />
        <SignUp />
      </div>
    )
  } else {
    props.history.push("/")
    return null;
  }
}
;

export default WithUser(withRouter(SignInAndSignUp));
