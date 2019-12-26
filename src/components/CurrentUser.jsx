import React from 'react';
import {firestore, auth} from "../firebase";
import {Link, withRouter} from "react-router-dom";

const CurrentUser = (props) => {
  const {displayName, photoURL, children} = props.user;

  const signOutHandler = async () => {
    await auth.signOut()
    props.history.push("/")
  }

  // Volver al avatar por defecto en caso de que error al cargar el avatar del storage o éste haya sido eliminado
  const onLoadErrorHandler = async () => {
    const userRef = firestore.collection("users").doc(auth.currentUser.uid);
    await userRef.update({photoURL: auth.currentUser.photoURL})
  }

  return (
    <section className="user">
      <div className="user__profile">
        <Link to="/profile">
          <div className="user__information">
            {photoURL &&
              <div className="user__img-container">
                <img src={photoURL} onError={onLoadErrorHandler} alt={displayName} />
              </div>
            }
            <p>{displayName && displayName.split(" ")[0]}</p>
          </div>
        </Link>
      </div>
      <div className="user__create-post">
        <button><Link to="/create-post">Create post</Link></button>
      </div>
      <div className="user__signout-btn">
        <div>{children}</div>
        <button onClick={signOutHandler}>Sign Out</button>
      </div>
    </section>
  );
};

export default withRouter(CurrentUser);
