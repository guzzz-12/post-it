import React,{useState, useEffect} from "react";
import {firestore} from "../../firebase";
import {withRouter} from "react-router-dom";
import PostPreview from "../PostPreview";
import Spinner from "../Spinner/Spinner";

const FilteredPosts = (props) => {
  const [filteredPosts, setFilteredPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const postsRef = firestore.collection("posts").where("category", "==", props.match.params.postCategory)

    const getPostsByCategory = async () => {
      let filteredPosts = []

      const filteredPostsRef = await postsRef.get()
      filteredPostsRef.forEach(doc => filteredPosts.push({...doc.data()}))

      return filteredPosts
    }

    getPostsByCategory().then((res) => {
      setFilteredPosts(res)
      setLoading(false)
    })

    return () => {
      setFilteredPosts([])
      setLoading(false)
    }

  }, [props.match.params.postCategory])

  const renderPosts = () => {
    return filteredPosts.map(post => <PostPreview {...post} key={post.id} />)
  }

  return (
    <div className="generic-wrapper">
      {!loading && <h2>Posts category: {props.match.params.postCategory}</h2>}
      {loading && filteredPosts.length === 0 && <Spinner />}
      {!loading && filteredPosts.length === 0 && <h2>No posts found...</h2>}
      {!loading && filteredPosts.length > 0 && renderPosts()}
    </div>
  );
}

export default withRouter(FilteredPosts);
