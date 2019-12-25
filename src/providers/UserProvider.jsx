import React, {useState, useEffect, createContext} from 'react';
import {firestore, auth, getUserDoc} from "../firebase";
import {withRouter} from "react-router-dom";

export const UserContext = createContext();

const UserProvider = (props) => {
  const [user, setUser] = useState({user: null});

  let unsubscribeFromAuth = null;
  let unsubscribeFromUsers = null;

  const updateUserPosts = async (uid, data) => {
    let promises = []
    let posts = []
    let userPosts = []

    const postsRef = firestore.collection("posts")

    const postSnapshot = await postsRef.get()

    postSnapshot.forEach(post => posts.push({id: post.id, ...post.data()}))

    userPosts = posts.filter(post => post.user.uid === uid)

    userPosts.forEach((post) => {
      const updatedPost = {...post}
      updatedPost.displayName = data.displayName;
      updatedPost.user.displayName = data.displayName;
      updatedPost.user.photoURL = data.photoURL;
      promises.push(postsRef.doc(post.id).update(updatedPost))
    })

    await Promise.all(promises)
  }

  useEffect(() => {
    auth.currentUser ? props.history.push("/profile") : props.history.push("/signin-signup")
  }, [user.user])
  
  useEffect(() => {
    // eslint-disable-next-line
    unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
      // Obtener el perfil del usuario
      const userDoc = user ? await getUserDoc(user.uid) : null
      setUser({user: userDoc})
    });

    // eslint-disable-next-line
    unsubscribeFromUsers = firestore.collection("users").onSnapshot(async (snap) => {
      if(user.user && auth.currentUser) {
        const user = snap.docs.find(el => {
          return el.id === auth.currentUser.uid
        })
        
        if(user) {
          await updateUserPosts(user.id, {...user.data()})
          setUser({
            user: {
              uid: user.id,
              ...user.data()
            }
          })
        }  
      }
    })
    
    return () => {
      unsubscribeFromAuth();
      unsubscribeFromUsers();
    }
  }, [auth.currentUser])
  
  return (
    <UserContext.Provider value={user.user}>
      {props.children}
    </UserContext.Provider>
  );
}

export default withRouter(UserProvider);
