import React from 'react';
import moment from 'moment';
import {firestore, auth} from "../firebase";
import {Link, withRouter} from "react-router-dom";

const CurrentUser = ({ displayName, photoURL, email, emailVerified, createdAt, children, history }) => {
  const signOutHandler = async () => {
    await auth.signOut()
    history.push("/")
  }

  // Volver al avatar por defecto en caso de que error al cargar el avatar del storage o éste haya sido eliminado
  const onLoadErrorHandler = async () => {
    const userRef = firestore.collection("users").doc(auth.currentUser.uid);
    await userRef.update({photoURL: auth.currentUser.photoURL})
  }

  return (
    <section className="CurrentUser">
      <div className="CurrentUser--profile">
        {photoURL &&
          <div className="CurrentUser__img-container">
            <img src={photoURL} onError={onLoadErrorHandler} alt={displayName} />
          </div>
        }
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
