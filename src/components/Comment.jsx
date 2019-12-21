import React from 'react';
import moment from 'moment';
import {Link} from "react-router-dom";

const Comment = ({id, content, user, createdAt, currentUser, onDelete }) => {
  return (
    <article className="Comment">
      <div className="Comment__main-content">
        <div className="Comment__user-avatar" style={{backgroundImage: `url(${user.photoURL})`}}></div>
        <dir className="Comment__text">
          <Link to={`/users/${user.uid}`}>
            <span className="Comment--author">{user.displayName}</span>
          </Link>          
          <span className="Comment--content">{content}</span>
        </dir>
        {currentUser && user.uid === currentUser.uid &&
          <div
            className="Comment__delete"
            onClick={() => onDelete(id)}
            title="Delete comment">
            <i className="far fa-window-close"></i>
          </div>
        }
      </div>
      <p className="Comment--timestamp">{moment(createdAt).calendar()}</p>
    </article>
  );
};

export default Comment;
