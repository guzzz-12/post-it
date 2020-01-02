import React, {useEffect, useState} from "react";
import {Link, withRouter} from "react-router-dom";
import WithUser from "./WithUser";
import CurrentUser from "./CurrentUser";
import EmailVerificationWarning from "./EmailVerificationWarning";
import Spinner from "./Spinner/Spinner";
import SearchPosts from "./SearchPosts/SearchPosts";

const Nav = (props) => {
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if(props.user || !props.user) {
      setUserLoaded(true)
    }
  }, [props.user])

  return (
    <React.Fragment>
      <nav className="main-nav">
        <div className="main-nav__content">
          <Link to="/"><h1>Post It!</h1></Link>
          <div style={{position: "relative", minHeight:"2rem", minWidth: "150px"}}>
            {!userLoaded && <Spinner transparent={true} small={true} white={true}/>}
            {!props.user && userLoaded &&
            <div className="main-nav__signin-signup">
              <div className="main-nav__signin">
                <Link to="/signin">Sing In</Link>
              </div>
              <div className="main-nav__signup">
                <Link to="/signup">Sign Up</Link>
              </div>
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
      <SearchPosts />
    </React.Fragment>
  );
}

export default WithUser(withRouter(Nav));
