import React from 'react';
import moment from 'moment';
import {firestore} from "../firebase";

const Post = ({id, title, content, user, createdAt, stars, comments}) => {
  const handleDelete = async (id) => {
    await firestore.collection("posts").doc(id).delete()
  }

  const addStar = async (id) => {
    const docRef = firestore.collection("posts").doc(id)
    const post = await docRef.get()
    const stars = post.data().stars

    await docRef.update({stars: stars + 1})
  }

  return (
    <article className="Post">
      <div className="Post--content">
        <h3>{title}</h3>
        <div>{content}</div>
      </div>
      <div className="Post--meta">
        <div>
          <p>
            <span role="img" aria-label="star">
              ⭐️
            </span>
            {stars}
          </p>
          <p>
            <span role="img" aria-label="comments">
              🙊
            </span>
            {comments}
          </p>
          <p>Posted by {user.displayName}</p>
          <p>{moment(createdAt).calendar()}</p>
        </div>
        <div>
          <button className="star" onClick={() => addStar(id)}>Star</button>
          <button className="delete" onClick={() => handleDelete(id)}>Delete</button>
        </div>
      </div>
    </article>
  );
};

export default Post;
