import React, {useReducer} from "react";
import SearchPostsContext from "./searchPostsContext";
import searchPostsReducer from "./searchPostsReducer";
import {SET_SEARCH_TERM, CLEAR_SEARCH, RESET_FILTER} from "../types";

const SearchPostsState = (props) => {
  const initialState = {
    searchTerm: null,
    clearFilter: false
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

  const resetFilter = () => {
    dispatch({
      type: RESET_FILTER
    })
  }

  return (
    <SearchPostsContext.Provider
      value={{
        searchTerm: state.searchTerm,
        clearFilter: state.clearFilter,
        setSearchTerm,
        clearSearch,
        resetFilter
      }}
    >
      {props.children}
    </SearchPostsContext.Provider>
  )
}

export default SearchPostsState
