import React, {useContext, useState, useEffect} from 'react'
import Post from './Post';
import { PostContext } from '../providers/PostsProvider';
import WithUser from './WithUser';
import Spinner from './Spinner/Spinner';

const Posts = (props) => {
  const posts = useContext(PostContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    setPostsLoaded(true)
  }, [posts])
  
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
    return posts.map(post => {
      return <Post {...post} key={post.id} />
    })
  }

  return (
    <React.Fragment>
      {isLoading && <Spinner position="flex-start"/>}
      <section className="Posts generic-wrapper">
        {posts.length > 0 && <h2 className="Posts__title">Posts</h2>}
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
