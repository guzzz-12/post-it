import {SET_SEARCH_TERM, CLEAR_SEARCH, RESET_FILTER} from "../types"

export default (state, action) => {
  switch(action.type) {
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
        clearFilter: false
      }
    case CLEAR_SEARCH:
      return {
        ...state,
        searchTerm: null,
        clearFilter: true
      }
    case RESET_FILTER:
      return {
        ...state,
        clearFilter: true
      }
    default:
      return state
  }
}