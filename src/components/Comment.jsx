import React from 'react';

import moment from 'moment';

const Comment = ({ content, user, createdAt }) => {
  return (
    <article className="Comment">
      <div className="Comment__main-content">
        <div className="Comment__user-avatar">
          <img src={user.photoURL} alt="User avatar"/>
        </div>
        <dir className="Comment__text">
          <span className="Comment--author">{user.displayName}</span>
          <span className="Comment--content">{content}</span>
        </dir>
      </div>
      <p className="Comment--timestamp">{moment(createdAt).calendar()}</p>
    </article>
  );
};

export default Comment;
