import React, {useReducer} from "react";
import LastPostContext from "./lastPostContext";
import lastPostReducer from "./lastPostReducer";
import { GET_LAST_POST, CLEAR_LAST_POST } from "../types";

const EditPostState = (props) => {
  const initialState = {
    lastPost: null
  }

  const [state, dispatch] = useReducer(lastPostReducer, initialState);

  const getLastPost = (post) => {
    dispatch({
      type: GET_LAST_POST,
      payload: post
    })
  }

  const clearLastPost = () => {
    dispatch({
      type: CLEAR_LAST_POST
    })
  }

  return (
    <LastPostContext.Provider
      value={{
        lastPost: state.lastPost,
        getLastPost,
        clearLastPost
      }}
    >
      {props.children}
    </LastPostContext.Provider>
  )
}

export default EditPostState;