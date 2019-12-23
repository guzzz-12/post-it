import React, {useContext} from 'react'
import Post from './Post';
import { PostContext } from '../providers/PostsProvider';
import WithUser from './WithUser';

const Posts = (props) => {
  const posts = useContext(PostContext);
  const renderPosts = () => {
    return posts.map(post => {
      return <Post {...post} key={post.id} />
    })
  }

  return (
    <section className="Posts">
      {posts.length > 0 && <h2 className="Posts__title">Posts</h2>}
      {renderPosts()}
      {!props.user &&
        <div className="Posts__message">
          <h2>Login to star creating your posts!</h2>
        </div>
      }
    </section>
  )
}

export default WithUser(Posts);
