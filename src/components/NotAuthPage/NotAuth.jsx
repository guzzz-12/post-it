import React from "react";
import {Link} from "react-router-dom";
import "./notAuth.scss";

const NotAuth = () => {
  return (
    <div className="no-auth generic-wrapper">
      <div className="no-auth__wrapper">
        <h1>Stop there!</h1>
        <i class="fas fa-exclamation-triangle"></i>
        <p>You need to be logged in to access this page</p>
        <div className="no-auth__content-buttons">
          <Link to="signin-signup"><p>Signin</p></Link>
          <Link to="signin-signup"><p>Signup</p></Link>
        </div>
      </div>
    </div>
  );
}

export default NotAuth;
