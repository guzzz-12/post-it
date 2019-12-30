import React, {useState, useContext, useEffect} from "react";
import "./filterPostsWidget.scss";
import SearchPostsContext from "../../context/searchPosts/searchPostsContext";

const FilterPostsWidget = (props) => {
  const searchPostsContext = useContext(SearchPostsContext);
  const [postCategory, setPostCategory] = useState("all");

  useEffect(() => {
    if(searchPostsContext.clearFilter) {
      setPostCategory("all")
      props.setFilter("all");
    }
  }, [searchPostsContext])

  const categoryHandler = (e) => {
    if(searchPostsContext.searchTerm) {
      searchPostsContext.clearSearch()
    }
    setPostCategory(e.target.value);
    props.setFilter(e.target.value);
  }

  return (
    <div className="posts__post-category">
      <h2>Filter:</h2>
      <div className="post-categories">
        <div className="post-category post-category--all">
          <label
            htmlFor="all"
            style={{backgroundColor: `${postCategory === "all" ? "#4791f1" : "#ccc"}`}}
          >
            All
          </label>
          <input type="radio" checked={postCategory === "all"} name="category" id="all" value="all" onClick={categoryHandler}/>
        </div>
        <div className="post-category post-category--science">
          <label
            htmlFor="science"
            style={{backgroundColor: `${postCategory === "science" ? "#4791f1" : "#ccc"}`}}
          >
            Science
          </label>
          <input type="radio" checked={postCategory === "science"} name="category" id="science" value="science" onClick={categoryHandler}/>
        </div>
        <div className="post-category post-category--technology">
          <label
            htmlFor="technology"
            style={{backgroundColor: `${postCategory === "technology" ? "#4791f1" : "#ccc"}`}}
          >
            Technology
          </label>
          <input type="radio" checked={postCategory === "technology"} name="category" id="technology" value="technology"  onClick={categoryHandler}/>
        </div>
        <div className="post-category post-category--development">
          <label
            htmlFor="development"
            style={{backgroundColor: `${postCategory === "development" ? "#4791f1" : "#ccc"}`}}
          >
            Development
          </label>
          <input type="radio" checked={postCategory === "development"} name="category" id="development" value="development"  onClick={categoryHandler}/>
        </div>
        <div className="post-category post-category--other">
          <label
            htmlFor="other"
            style={{backgroundColor: `${postCategory === "other" ? "#4791f1" : "#ccc"}`}}
          >
            Other
          </label>
          <input type="radio" checked={postCategory === "other"} name="category" id="other" value="other"  onClick={categoryHandler}/>
        </div>
      </div>
    </div>
  );
}

export default FilterPostsWidget;
