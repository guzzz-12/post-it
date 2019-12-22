import React from 'react'
import Comment from './Comment';
import AddComment from './AddComment';

const Comments = ({ comments, onCreate, user, onDelete }) => {
  return (
    <section className="Comments">
      {comments.length > 0 && <h3>{comments.length} comments</h3>}
      {comments.map(comment => <Comment {...comment} currentUser={user} onDelete={onDelete} key={comment.id} />)}
      {!user &&
        <div className="Posts__message">
          <h2>Login to add comments</h2>
        </div>
      }
      {user && <AddComment onCreate={onCreate} />}
    </section>
  )
}

export default Comments;
