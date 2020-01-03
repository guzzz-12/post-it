import React, {useState, useEffect, createContext} from 'react';
import {firestore, auth, createUserProfileDoc} from "../firebase";
import {withRouter} from "react-router-dom";

export const UserContext = createContext();

const UserProvider = (props) => {
  const [user, setUser] = useState({user: null});

  let unsubscribeFromAuth = null;
  let unsubscribeFromUsers = null;

  // Funcionalidad para actualizar los post del usuario cuando ése actualiza su perfil
  const updateUserPosts = async (uid, data) => {
    console.log("posts changed")

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
      if(auth.currentUser) {      
        const updatedUserRef = snap.docs.find(el => {
          return el.id === auth.currentUser.uid
        })

        
        //Actualizar información y posts del usuario cuando este modifica su perfil
        if(updatedUserRef) {
          // Verificar si el usuario verificó su email
          await updatedUserRef.ref.update({emailVerified: auth.currentUser.emailVerified})

          // Enviar la data actualizada del usuario a los componentes para actualizar la interfaz
          let updatedUser = updatedUserRef.data()
          
          setUser({
            user: {
              uid: updatedUserRef.id,
              ...updatedUser
            }
          })

          // Actualizar los posts del usuario con la información actualizada del perfil
          await updateUserPosts(updatedUserRef.id, {...updatedUser})  
        }

        // Borrar data del usuario del state si éste borra su cuenta
        snap.docChanges().forEach(change => {
          if(change.type === "removed" && change.doc.id === user.user.uid) {
            setUser({
              user: null
            })  
          }
        })
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
