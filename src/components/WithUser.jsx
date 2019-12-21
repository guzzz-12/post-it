import React from 'react';
import {UserContext} from "../providers/UserProvider";

const WithUser = (Component) => {
  return (props) => {
    return (
      <UserContext.Consumer>
        {(user) => <Component user={user} {...props} />}
      </UserContext.Consumer>
    )
  }
}

export default WithUser;
