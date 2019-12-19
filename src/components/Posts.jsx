import React, {useContext} from 'react'
import Post from './Post';
import AddPost from './AddPost';
import { PostContext } from '../providers/PostsProvider';

const Posts = () => {
  const posts = useContext(PostContext);
  const renderPosts = () => {
    return posts.map(post => {
      return <Post {...post} key={post.id} />
    })
  }

  return (
    <section className="Posts">
      <AddPost/>
      {renderPosts()}
    </section>
  )
}

export default Posts;
