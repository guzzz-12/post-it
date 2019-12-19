import React, {useState, useEffect, createContext} from 'react';
import {firestore, auth, createUserProfileDoc} from "../firebase";

export const UserContext = createContext();

const UserProvider = (props) => {
  const [user, setUser] = useState({user: null});

  let unsubscribeFromAuth = null;
  let unsubscribeFromUsers = null;

  const updateUserPosts = async (uid, name) => {
    let promises = []
    let posts = []
    let userPosts = []

    const postsRef = firestore.collection("posts")

    const postSnapshot = await postsRef.get()

    postSnapshot.forEach(post => posts.push({id: post.id, ...post.data()}))

    userPosts = posts.filter(post => post.user.uid === uid)

    userPosts.forEach((post) => {
      const updatedPost = {...post}
      updatedPost.displayName = name;
      updatedPost.user.displayName = name;
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
    unsubscribeFromUsers = firestore.collection("users").onSnapshot((snap) => {
      if(user && auth.currentUser) {
        const user = snap.docs.find(el => {
          return el.id === auth.currentUser.uid
        })
        
        if(user && user.displayName !== user.data().displayName) {
          updateUserPosts(user.id, user.data().displayName)
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

export default UserProvider;
