import React, {useState, useEffect} from "react";
import moment from "moment";
import {Link, withRouter} from "react-router-dom";
import {firestore, auth} from "../firebase";
import WithUser from "./WithUser";

const PostMain = (props) => {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    const docRef = firestore.collection("posts").doc(props.post.id)

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
      
      const userRef = firestore.collection("users").doc(props.user.uid)
      const userSnap = await userRef.get()
      const userPosts = userSnap.data().posts
      const deletedPostIndex = userPosts.indexOf(id)
      userPosts.splice(deletedPostIndex, 1)
      
      await userRef.update({posts: userPosts})

      props.history.push("/");
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
    <section className="post-main">
      <article className="post-main__content">
        <h1 className="post-main__title">{props.post.title}</h1>
        <div className="post-main__info">
          <p className="post-main__info-author">
            <Link to={`/users/${props.post.user.uid}`}>Created by: {props.post.user.displayName}</Link>
          </p>
          <p className="post-main__info-date">{moment(props.post.createdAt).calendar()}</p>
        </div>
        <div className="post-main__content">
          <p>{props.post.content}</p>
        </div>
      </article>
      <div className="post-main__user-actions">
        <div className="post-main__likes">
          <p><i className="far fa-thumbs-up" /> {props.post.stars && props.post.stars.length}</p>
        </div>
        <div className="post-main__buttons">
          {props.user && props.user.uid === props.post.user.uid &&
            <button className="delete" onClick={() => handleDelete(props.post.id)}>Delete post</button>
          }
          {props.user &&
            <button
              className="star"
              onClick={!starred ? () => addStar(props.post.id) : () => removeStar(props.post.id)}
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
    </section>
  );
}

export default WithUser(withRouter(PostMain));
