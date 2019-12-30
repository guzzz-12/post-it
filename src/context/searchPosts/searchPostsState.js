import React, {useReducer} from "react";
import SearchPostsContext from "./searchPostsContext";
import searchPostsReducer from "./searchPostsReducer";
import {SET_SEARCH_TERM, CLEAR_SEARCH} from "../types";

const SearchPostsState = (props) => {
  const initialState = {
    searchTerm: null
  }

  const [state, dispatch] = useReducer(searchPostsReducer, initialState);

  const setSearchTerm = (term) => {
    dispatch({
      type: SET_SEARCH_TERM,
      payload: term
    })
  }

  const clearSearch = () => {
    dispatch({
      type: CLEAR_SEARCH
    })
  }

  return (
    <SearchPostsContext.Provider
      value={{
        searchTerm: state.searchTerm,
        setSearchTerm,
        clearSearch
      }}
    >
      {props.children}
    </SearchPostsContext.Provider>
  )
}

export default SearchPostsState
