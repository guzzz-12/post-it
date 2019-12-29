import React, {useReducer} from "react";
import EditPostContext from "./editPostContext";
import editPostReducer from "./editPostReducer";
import { SET_LOADING, EDIT_POST, CLEAR_POST_DATA } from "../types";

const EditPostState = (props) => {
  const initialState = {
    postId: null,
    postTitle: null,
    postCategory: null,
    postContent: null,
    loadingPost: false
  }

  const [state, dispatch] = useReducer(editPostReducer, initialState);

  const setPostLoading = (bool) => {
    dispatch({
      type: SET_LOADING,
      payload: bool
    })
  }

  const setPostContent = (postData) => {
    dispatch({
      type: EDIT_POST,
      payload: postData
    })
  }

  const clearPostContent = () => {
    dispatch({
      type: CLEAR_POST_DATA
    })
  }

  return (
    <EditPostContext.Provider
      value={{
        postId: state.postId,
        postTitle: state.postTitle,
        postCategory: state.postCategory,
        postContent: state.postContent,
        loadingPost: state.loadingPost,
        setPostLoading,
        setPostContent,
        clearPostContent
      }}
    >
      {props.children}
    </EditPostContext.Provider>
  )
}

export default EditPostState;
