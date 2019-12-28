import React, {useEffect, useState, createContext} from 'react';
import {firestore} from "../firebase";
import {collectIdsAndDocs} from "../utils";

export const PostContext = createContext();

const PostsProvider = (props) => {
  const [posts, setPosts] = useState([]);

  let unsubscribeFromFirestore = null;

  useEffect(() => {
    // eslint-disable-next-line
    unsubscribeFromFirestore = firestore.collection("posts").orderBy("createdAt", "asc").onSnapshot((snap) => {
      const posts = snap.docs.map(collectIdsAndDocs);
      setPosts(posts)
    })

    return () => {
      unsubscribeFromFirestore();
    }
  }, [])

  return (
    <PostContext.Provider value={posts}>
      {props.children}
    </PostContext.Provider>
  );
}

export default PostsProvider;
