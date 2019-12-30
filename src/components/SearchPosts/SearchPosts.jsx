import React, {useState, useContext, useEffect} from "react";
import "./searchPosts.scss";
import {withRouter} from "react-router-dom";
import SearchPostsContext from "../../context/searchPosts/searchPostsContext";

const SearchPosts = (props) => {
  const searchPostsContext = useContext(SearchPostsContext);

  const [searchTerm, setSearchTerm] = useState(null);

  useEffect(() => {
    if(props.location.pathname !== "/") {
      setSearchTerm(null)
      searchPostsContext.clearSearch()
    }
     // eslint-disable-next-line
  }, [props.location.pathname])

  const onChangeHandler = (e) => {
    setSearchTerm(e.target.value)
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    searchPostsContext.setSearchTerm(searchTerm)
  }

  const clearSearchHandler = () => {
    setSearchTerm(null)
    searchPostsContext.clearSearch()
  }

  return (
    <React.Fragment>
      {props.location.pathname === "/" &&
        <div className="search-posts generic-wrapper">
          <form className="search-posts__form" onSubmit={onSubmitHandler}>
            <div className="search-posts__input-container">
              <input
                type="text"
                value={searchTerm || ""}
                onChange={onChangeHandler}
                placeholder="Search posts by title (add only one word)"
              />
              <span
                onClick={clearSearchHandler}
                className={`search-posts__clear-search ${searchTerm && "search-posts__clear-search--show"}`}
              >
                Clear search
              </span>
              <i class="fas fa-search"></i>
            </div>
          </form>
        </div>
      }
    </React.Fragment>
  );
}

export default withRouter(SearchPosts);
