import React, {useState, useContext} from "react";
import "./searchPosts.scss";
import {withRouter} from "react-router-dom";
import SearchPostsContext from "../../context/searchPosts/searchPostsContext";

const SearchPosts = (props) => {
  const searchPostsContext = useContext(SearchPostsContext);

  const [searchTerm, setSearchTerm] = useState(null);

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
    searchPostsContext.resetFilter()
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
                placeholder="Search posts by title"
              />
              <span
                onClick={clearSearchHandler}
                className={`search-posts__clear-search ${searchTerm && "search-posts__clear-search--show"}`}
              >
                Clear search
              </span>
              <i className="fas fa-search"></i>
            </div>
          </form>
        </div>
      }
    </React.Fragment>
  );
}

export default withRouter(SearchPosts);
