import React, {useState} from 'react';
import moment from 'moment';
import {firestore, auth} from "../firebase";

const Post = ({id, title, content, user, createdAt, stars, comments}) => {
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    try {
      await firestore.collection("posts").doc(id).delete();
      setError(null);  
    } catch (err) {
      setError(err.message)
      console.log(err)
    }
  }

  const addStar = async (id) => {
    try {
      const docRef = firestore.collection("posts").doc(id)
      const post = await docRef.get()
      const stars = post.data().stars  
      await docRef.update({stars: stars + 1})  
    } catch (err) {
      setError(err.message)
      console.log(err)
    }
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
          <p>Posted by {user && user.displayName}</p>
          <p>{moment(createdAt).calendar()}</p>
        </div>
        <div>
          {auth.currentUser && auth.currentUser.uid === user.uid &&
            <React.Fragment>
              <button className="star" onClick={() => addStar(id)}>Star</button>
              <button className="delete" onClick={() => handleDelete(id)}>Delete</button>
            </React.Fragment>
          }
        </div>
      </div>
    </article>
  );
};

export default Post;
