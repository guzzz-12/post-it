import React from "react"

import SignIn from "./SignIn";
import SignUp from "./SignUp";
import WithUser from "./WithUser";
import {withRouter} from "react-router-dom";

const SignInAndSignUp = (props) => {
  document.title = "Post It! | Signin - Signup"

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
