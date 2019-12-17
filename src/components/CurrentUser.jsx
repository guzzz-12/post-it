import React from 'react';
import moment from 'moment';
import {auth} from "../firebase";

const CurrentUser = ({ displayName, photoURL, email, createdAt, children }) => {
  return (
    <section className="CurrentUser">
      <div className="CurrentUser--profile">
        {photoURL && <img src={photoURL} alt={displayName} />}
        <div className="CurrentUser--information">
          <h2>{displayName}</h2>
          <p className="email">{email}</p>
          <p className="created-at">{moment(createdAt).calendar()}</p>
        </div>
      </div>
      <div>
        <div>{children}</div>
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
    </section>
  );
};

export default CurrentUser;
