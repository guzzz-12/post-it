import React, {useContext, useState, useEffect} from 'react'
import {firestore} from "../firebase";
import PostPreview from './PostPreview';
import { PostContext } from '../providers/PostsProvider';
import WithUser from './WithUser';
import Spinner from './Spinner/Spinner';
import SearchPostsContext from "../context/searchPosts/searchPostsContext";
import FilterPostsWidget from './FilterPostsWidget/FilterPostsWidget';

const Posts = (props) => {
  document.title = "Post It! | Home"

  const allPosts = useContext(PostContext);
  const searchPostsContext = useContext(SearchPostsContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [searchPosts, setSearchPosts] = useState(null);
  const [filter, setFilter] = useState("all");

  // Buscar posts por título
  useEffect(() => {    
    if(searchPostsContext.searchTerm) {
      const searchTermArray = searchPostsContext.searchTerm.toLowerCase().split(" ")
      setIsLoading(true)
      searchPostsContext.resetFilter()
      
      firestore.collection("posts")
      .where("titleArray", "array-contains-any", searchTermArray)
      .get()
      .then((snap) => {
        const foundPosts = []
        snap.forEach(doc => foundPosts.push(doc.data()))
        setIsLoading(false)
        setSearchPosts(foundPosts)
      })
      .catch((err) => console.log(err))
    } else {
      setSearchPosts(null)
    }
  }, [searchPostsContext])


  // Filtrar posts por categoría
  useEffect(() => {
    const postsRef = firestore.collection("posts");
    
    const getFilteredPosts = async () => {
      // setSearchPosts(null)
      const filteredPosts = [];
      const filteredPostsSnapshot = await postsRef.where("category", "==", filter).orderBy("createdAt", "desc").get()
      filteredPostsSnapshot.forEach(doc => filteredPosts.push(doc.data()))
      return filteredPosts;
    }
    
    if(filter !== "all") {
      setIsLoading(true)
      getFilteredPosts().then((res) => {
        setIsLoading(false)
        setSearchPosts(res)
      })
    } else {
      setSearchPosts(null)
    }

  }, [filter])

  // Indicar carga inicial de los posts
  useEffect(() => {
    setPostsLoaded(true)
  }, [allPosts])
  
  useEffect(() => {
    if(postsLoaded) {
      setIsLoading(false)
    }
  }, [postsLoaded])

  // Indicar carga de la data del usuario
  useEffect(() => {
    if(props.user) {
      setUserLoaded(true)
    }
  }, [props.user])

  // Callback a ejecutar en FilterPostsWidget para tomar el filtro seleccionado
  const setFilterHandler = (filter) => {
    if(searchPostsContext.searchTerm) {
      searchPostsContext.clearSearch()
    }
    setFilter(filter)
  }

  // Generar los preview de los posts
  const renderPosts = () => {
    if(searchPosts && searchPosts.length > 0) {
      return searchPosts.map(post => {
        return <PostPreview {...post} key={post.id} />
      })
    } else if (searchPosts && searchPosts.length === 0) {
      return <h2>No posts found...</h2>
    }
    return !isLoading &&!searchPosts && allPosts.map(post => {
      return <PostPreview {...post} key={post.id} />
    })
  }

  return (
    <React.Fragment>
      <section className="Posts generic-wrapper">
          {isLoading && allPosts.length === 0 && <Spinner top="3rem" position="flex-start"/>}
          {allPosts.length > 0 && <h2 className="Posts__title">Posts</h2>}
          {allPosts.length > 0 && <FilterPostsWidget setFilter={setFilterHandler} />}
          <div className="Posts__content" style={{position: "relative"}}>
            {isLoading && <Spinner top="3rem" position="flex-start"/>}
            {renderPosts()}        
          </div>
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
