import { SET_LOADING, EDIT_POST, CLEAR_POST_DATA } from "../types";

export default (state, action) => {
  switch(action.type) {
    case SET_LOADING:
      return {
        ...state,
        loadingPost: action.payload
      }
    case EDIT_POST:
      return {
        ...state,
        postId: action.payload.postId,
        postTitle: action.payload.postTitle,
        postContent: action.payload.postContent
      }
    case CLEAR_POST_DATA:
      return {
        ...state,
        postId: null,
        postTitle: null,
        postContent: null
      }
    default:
      return state
  }
}