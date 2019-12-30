import {SET_SEARCH_TERM, CLEAR_SEARCH} from "../types"

export default (state, action) => {
  switch(action.type) {
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      }
    case CLEAR_SEARCH:
      return {
        ...state,
        searchTerm: null
      }
    default:
      return state
  }
}