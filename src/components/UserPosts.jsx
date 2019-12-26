import React, {useState, useEffect, useContext} from "react";
import {PostContext} from "../providers/PostsProvider";
import PostPreview from "./PostPreview";

const UserPosts = (props) => {
  const postsFromProvider = useContext(PostContext)
  const [userPosts, setUserPosts] = useState([])

  useEffect(() => {
    const filteredPosts = []
    if(props.user && props.user.posts) {
      for(let id of props.user.posts) {
        let post = postsFromProvider.find(post => post.id === id)
        filteredPosts.push(post)
      }
      setUserPosts(filteredPosts)
    }
    // eslint-disable-next-line
  }, [postsFromProvider, props.user])

  const renderUserPosts = () => {
    if(userPosts.length > 0) {
      return userPosts.map((post) => {
        return (
          post && <PostPreview {...post} key={post.id} />
        )
      })
    }
  }

  return (
    <React.Fragment>
      {userPosts.length > 0 &&
        <div>
          <h2>User posts:</h2>
          {renderUserPosts()}
        </div>
      }
    </React.Fragment>
  );
}

export default UserPosts;
