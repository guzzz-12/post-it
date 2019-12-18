import React, {useState, useEffect} from 'react';
import moment from 'moment';
import {firestore, auth} from "../firebase";

const Post = ({id, title, content, user, createdAt, stars, comments}) => {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    const checkStars = async () => {
      const docRef = firestore.collection("posts").doc(id)
      const post = await docRef.get()
      const stars = post.data().stars
      const userId = auth.currentUser.uid
  
      if(!stars.includes(userId)) {
        setStarred(false)
      } else {
        setStarred(true)
      }
    }

    if(auth.currentUser) {
      checkStars().then(() => console.log("Stars Checked"))
    } else {
      setStarred(false)
    }

    // eslint-disable-next-line
  }, [])

  const handleDelete = async (id) => {
    try {
      await firestore.collection("posts").doc(id).delete(); 
    } catch (err) {
      console.log(err)
    }
  }

  const addStar = async (id) => {
    try {
      const docRef = firestore.collection("posts").doc(id)
      const post = await docRef.get()
      const stars = post.data().stars
      const userId = auth.currentUser.uid

      if(!stars.includes(userId)) {
        stars.push(userId)
        await docRef.update({stars})
        setStarred(true)
      }

    } catch (err) {
      console.log(err)
    }
  }

  const removeStar = async (id) => {
    try {
      const docRef = firestore.collection("posts").doc(id)
      const post = await docRef.get()
      const userId = auth.currentUser.uid
  
      const updatedStars = post.data().stars.filter(star => star !== userId)
  
      await docRef.update({stars: updatedStars})
  
      setStarred(false)
      
    } catch (error) {
      console.log(error)
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
            {stars.length}
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
            <button className="delete" onClick={() => handleDelete(id)}>Delete</button>
          }
          {auth.currentUser &&
            <button
              className="star"
              onClick={!starred ? () => addStar(id) : () => removeStar(id)}
            >
              {starred ?
                <span>Dislike <i className="far fa-thumbs-down"></i></span>
                :
                <span>Like <i className="far fa-thumbs-up"></i></span>
              }
            </button>
          }
        </div>
      </div>
    </article>
  );
};

export default Post;
