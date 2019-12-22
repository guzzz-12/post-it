import React from "react";
import {Link} from "react-router-dom";
import WithUser from "./WithUser";
import CurrentUser from "./CurrentUser";
import EmailVerificationWarning from "./EmailVerificationWarning";

const Nav = (props) => {
  return (
    <React.Fragment>
      <nav
        className="main-nav"
        style={{marginBottom: `${!props.user || (props.user && props.user.emailVerified) ? "2rem" : "0"}`}}
      >
        <div className="main-nav__content">
          <Link to="/"><h1>Think Piece</h1></Link>
          {!props.user ?
            <div className="main-nav__signin-signup">
              <Link to="/signin-signup">Sing In or Sign Up</Link>
            </div>
            :
            <div className="main-nav__current-user">
              <CurrentUser user={props.user} />
            </div>
          }
        </div>
      </nav>
      <EmailVerificationWarning user={props.user} />
    </React.Fragment>
  );
}

export default WithUser(Nav);
