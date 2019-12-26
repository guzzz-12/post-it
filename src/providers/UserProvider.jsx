import React, {useState, useEffect, createContext} from 'react';
import {firestore, auth, createUserProfileDoc} from "../firebase";
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
    // eslint-disable-next-line
    unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
      const userDoc = await createUserProfileDoc(user)
      setUser({user: userDoc})
    });

    // eslint-disable-next-line
    unsubscribeFromUsers = firestore.collection("users").onSnapshot(async (snap) => {
      console.log("user changed")
      if(user.user && auth.currentUser) {        
        const updatedUserRef = snap.docs.find(el => {
          return el.id === auth.currentUser.uid
        })
        
        if(updatedUserRef) {
          let updatedUser = updatedUserRef.data()
          
          await updateUserPosts(updatedUserRef.id, {...updatedUser})

          setUser({
            user: {
              uid: updatedUser.id,
              ...updatedUser
            }
          })
        }
      }

      if(auth.currentUser && user.user && user.user.emailVerified !== auth.currentUser.emailVerified) {
        const userRef = firestore.collection("users").doc(auth.currentUser.uid)
        const userSnap = await userRef.get()
        if(userSnap.exists) {
          await userRef.update({emailVerified: auth.currentUser.emailVerified})
          setUser({
            user: {
              ...user.user,
              emailVerified: auth.currentUser.emailVerified
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
