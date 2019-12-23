import React, {useEffect, useState} from "react";
import {firestore, auth} from "../firebase";
import {withRouter} from "react-router-dom";
import UserPosts from "./UserPosts";
import UserInfo from "./UserInfo";
import Spinner from "./Spinner/Spinner";

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
  
      getUser()

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
      {!user && !notFound && <Spinner />}
      {!user && notFound && "User not found..."}
      {user && !notFound &&
        <React.Fragment>
          <UserInfo user={user} />
          <UserPosts user={user} />
        </React.Fragment>
      }
    </React.Fragment>
  );
}

export default withRouter(User);
