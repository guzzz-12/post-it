import React, {useEffect, useState, createContext, useContext} from 'react';
import LastPostContext from "../context/lastPost/lastPostContext";
import {firestore} from "../firebase";
import {collectIdsAndDocs} from "../utils";

export const PostContext = createContext();

const PostsProvider = (props) => {
  const lastPostContext = useContext(LastPostContext);  
  const [allPosts, setAllPosts] = useState([]);

  let unsubscribeFromFirestore = null;

  useEffect(() => {
    // eslint-disable-next-line
    unsubscribeFromFirestore = firestore
      .collection("posts")
      .orderBy("createdAt", "asc")
      .onSnapshot((snap) => {
        const posts = snap.docs.map(collectIdsAndDocs);
        setAllPosts(posts)
        
        // Chequear si se agregó un nuevo post para mostrar la notificación a los usuarios
        snap.docChanges().forEach(change => {
          if(change.type === "added" ) {
            lastPostContext.getLastPost({id: change.doc.id, ...change.doc.data()});
          }
        })
      })

    return () => {
      unsubscribeFromFirestore();
    }
  }, [])

  return (
    <PostContext.Provider value={allPosts}>
      {props.children}
    </PostContext.Provider>
  );
}

export default PostsProvider;
