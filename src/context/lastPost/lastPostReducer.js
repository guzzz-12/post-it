import { GET_LAST_POST, CLEAR_LAST_POST } from "../types"

export default (state, action) => {
  switch(action.type) {
    case GET_LAST_POST:
      return {
        ...state,
        lastPost: action.payload
      }
    case CLEAR_LAST_POST:
      return {
        ...state,
        lastPost: null
      }
    default:
      return state
  }
}