import React, {useContext, useState, useEffect} from 'react'
import {firestore} from "../firebase";
import PostPreview from './PostPreview';
import { PostContext } from '../providers/PostsProvider';
import WithUser from './WithUser';
import Spinner from './Spinner/Spinner';
import SearchPostsContext from "../context/searchPosts/searchPostsContext";

const Posts = (props) => {
  document.title = "Post It! | Home"

  const allPosts = useContext(PostContext);
  const searchPostsContext = useContext(SearchPostsContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [searchPosts, setSearchPosts] = useState(null);

  useEffect(() => {
    if(searchPostsContext.searchTerm) {
      const posts = []

      firestore.collection("posts")
      .where("titleArray", "array-contains", searchPostsContext.searchTerm.toLowerCase())
      .get()
      .then((snap) => {
        snap.forEach(doc => posts.push(doc.data()))
        setSearchPosts(posts)
      })
      .catch((err) => console.log(err))
    } else {
      setSearchPosts(null)
    }
  }, [searchPostsContext])

  useEffect(() => {
    setPostsLoaded(true)
  }, [allPosts])
  
  useEffect(() => {
    if(postsLoaded) {
      setIsLoading(false)
    }
  }, [postsLoaded])

  useEffect(() => {
    if(props.user) {
      setUserLoaded(true)
    }
  }, [props.user])

  const renderPosts = () => {
    if(searchPosts && searchPosts.length > 0) {
      return searchPosts.map(post => {
        return <PostPreview {...post} key={post.id} />
      })
    } else if (searchPosts && searchPosts.length === 0) {
      return <h2>No posts match your search...</h2>
    }
    return allPosts.map(post => {
      return <PostPreview {...post} key={post.id} />
    })
  }

  return (
    <React.Fragment>
      {isLoading && <Spinner position="flex-start"/>}
      <section className="Posts generic-wrapper">
        {allPosts.length > 0 && <h2 className="Posts__title">Posts</h2>}
        {renderPosts()}
        {userLoaded && !props.user && !isLoading &&
          <div className="Posts__message">
            <h2>Login to star creating your posts!</h2>
          </div>
        }
      </section>
    </React.Fragment>
  )
}

export default WithUser(Posts);
