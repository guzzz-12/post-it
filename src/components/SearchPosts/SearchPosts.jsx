import React, {useState} from "react";
import "./searchPosts.scss";
import {withRouter} from "react-router-dom";

const SearchPosts = (props) => {
  const [searchTerm, setSearchTerm] = useState("")

  const onChangeHandler = (e) => {
    setSearchTerm(e.target.value)
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    console.log(searchTerm)
  }

  return (
    <React.Fragment>
      {props.location.pathname === "/" &&
        <div className="search-posts generic-wrapper">
          <form className="search-posts__form" onSubmit={onSubmitHandler}>
            <div className="search-posts__input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={onChangeHandler}
                placeholder="Search post"
              />
              <i class="fas fa-search"></i>
            </div>
          </form>
        </div>
      }
    </React.Fragment>
  );
}

export default withRouter(SearchPosts);
