import React from 'react';
import moment from 'moment';
import {auth} from "../firebase";
import {Link, withRouter} from "react-router-dom";

const CurrentUser = ({ displayName, photoURL, email, emailVerified, createdAt, children, history }) => {
  const signOutHandler = async () => {
    await auth.signOut()
    history.push("/")
  }

  return (
    <section className="CurrentUser">
      <div className="CurrentUser--profile">
        {photoURL && <img src={photoURL} alt={displayName} />}
        <div className="CurrentUser--information">
          <Link to="/profile">
            <h2>{displayName}</h2>
          </Link>
          <p className="email">{email}</p>
          <p className="created-at">{moment(createdAt).calendar()}</p>
        </div>
      </div>
      <div>
        <div>{children}</div>
        <button onClick={signOutHandler}>Sign Out</button>
      </div>
    </section>
  );
};

export default withRouter(CurrentUser);
