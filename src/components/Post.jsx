import React, {useState, useEffect, useContext} from 'react';
import moment from 'moment';
import {firestore, auth} from "../firebase";
import {UserContext} from "../providers/UserProvider";
import {Link, withRouter} from "react-router-dom";

const Post = ({id, title, content, user, createdAt, stars, comments, history}) => {
  const [starred, setStarred] = useState(false);

  const userfromContext = useContext(UserContext);

  useEffect(() => {
    const docRef = firestore.collection("posts").doc(id)

    if(auth.currentUser) {
      const checkStars = async () => {
        const post = await docRef.get()

        if(post.exists) {
          const stars = post.data().stars
          const userId = auth.currentUser.uid
          if(!stars.includes(userId)) {
            setStarred(false)
          } else {
            setStarred(true)
          }
        }    
      }
      checkStars().then(() => console.log("Stars Checked"))
    } else {
      setStarred(false)
    }

    // eslint-disable-next-line
  }, [auth.currentUser])

  const handleDelete = async (id) => {
    try {  
      await firestore.collection("posts").doc(id).delete();

      const userRef = firestore.collection("users").doc(userfromContext.uid)
      const userSnap = await userRef.get()
      const userPosts = userSnap.data().posts
      const deletedPostIndex = userPosts.indexOf(id)
      userPosts.splice(deletedPostIndex, 1)
      
      await userRef.update({posts: userPosts})
      
      setStarred(false)
      history.push("/");
      
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
      <Link to={`/post/${id}`}>
        <div className="Post--content">
          <div
            className="Post--content-img"
            style={{
              backgroundImage: `url(${user.photoURL})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div className="Post--content-text">
            <h3>{title}</h3>
            <div>{content}</div>
          </div>
        </div>
      </Link>
      <div className="Post--meta">
        <div>
          <p>
            <span role="img" aria-label="star">
              <i className="far fa-thumbs-up" />
            </span>
            {" "}
            {stars.length}
          </p>
          <p>
            <span role="img" aria-label="comments">
              {comments} Comments
            </span>
          </p>
          <p>Posted by <Link to={`/users/${user.uid}`}>{user && user.displayName}</Link></p>
          <p>{moment(createdAt).calendar()}</p>
        </div>
        <div>
          {userfromContext && userfromContext.uid === user.uid &&
            <button className="delete" onClick={() => handleDelete(id)}>Delete</button>
          }
          {userfromContext &&
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

export default withRouter(Post);
