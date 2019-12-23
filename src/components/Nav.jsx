import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import WithUser from "./WithUser";
import CurrentUser from "./CurrentUser";
import EmailVerificationWarning from "./EmailVerificationWarning";
import Spinner from "./Spinner/Spinner";

const Nav = (props) => {
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if(props.user || props.user === undefined) {
      setUserLoaded(true)
    }
  }, [props.user])

  return (
    <React.Fragment>
      <nav
        className="main-nav"
        style={{marginBottom: `${!props.user || (props.user && props.user.emailVerified) ? "2rem" : "0"}`}}
      >
        <div className="main-nav__content">
          <Link to="/"><h1>Think Piece</h1></Link>
          <div style={{position: "relative", minHeight:"2rem", minWidth: "150px"}}>
            {!userLoaded && <Spinner transparent={true} small={true} white={true}/>}
            {!props.user && userLoaded &&
              <div className="main-nav__signin-signup">
                <Link to="/signin-signup">Sing In or Sign Up</Link>
              </div>
            }
            {props.user && userLoaded &&
              <div className="main-nav__current-user">
                <CurrentUser user={props.user} />
              </div>            
            }
          </div>
        </div>
      </nav>
      <EmailVerificationWarning user={props.user} />
    </React.Fragment>
  );
}

export default WithUser(Nav);
