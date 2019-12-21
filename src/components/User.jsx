import React, {useEffect, useState} from "react";
import moment from "moment";
import {firestore, auth} from "../firebase";
import {withRouter} from "react-router-dom";

const User = (props) => {
  const [user, setUser] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if(props.match.params.userId) {
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

    } else if(props.currentUser) {
      setUser(props.currentUser)
    } else if(!props.match.params.userId && !props.currentUser && !auth.currentUser) {
      props.history.push("/")
    }

    return () => {
      setUser(null)
      setNotFound(false)
    }

    // eslint-disable-next-line
  }, [props.match.params.userId, props.currentUser, auth.currentUser])

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
                <h2>{user.displayName}</h2>
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
