import React, {useEffect, useState} from "react";
import moment from "moment";
import {firestore, auth} from "../firebase";
import {Link, withRouter} from "react-router-dom";

const User = (props) => {
  const [user, setUser] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const userRef = firestore.collection("users").doc(props.match.params.userId);

    const getUser = async () => {
      const userSnap = await userRef.get()

      if(!userSnap.exists) {
        setNotFound(true);
        setUser(null)
      }

      const user = userSnap.data()
      setUser(user);
    }

    getUser();

    return () => {
      setUser(null)
      setNotFound(false)
    }

  }, [props.match.params.userId])

  return (
    <React.Fragment>
      {!user && !notFound && "Loading..."}
      {!user && notFound && "User not found..."}
      {user && !notFound &&
        <section className="CurrentUser">
          <div className="CurrentUser--profile">
            {user.photoURL &&
              <div className="CurrentUser__img-container">
                <img src={user.photoURL} alt={user.displayName} />
              </div>
            }
            <div className="CurrentUser--information">
              <Link to={`/users/${props.match.params.userId}`}>
                <h2>{user.displayName}</h2>
              </Link>
              <p className="email">{user.email}</p>
              <p className="created-at">{moment(user.createdAt).calendar()}</p>
            </div>
          </div>
        </section>      
      }
    </React.Fragment>
  );
}

export default withRouter(User);
