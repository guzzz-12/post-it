import React from "react";
import {Link} from "react-router-dom";
import WithUser from "./WithUser";
import CurrentUser from "./CurrentUser";

const Nav = (props) => {
  return (
    <nav className="main-nav">
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
  );
}

export default WithUser(Nav);
