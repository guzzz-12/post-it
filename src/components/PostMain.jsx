import React, {useState, useEffect, useContext} from "react";
import moment from "moment";
import {Link, withRouter} from "react-router-dom";
import {firestore, auth} from "../firebase";
import WithUser from "./WithUser";
import ReactHtmlParser from 'react-html-parser';
import ConfirmModal from "./ConfirmModal/ConfirmModal";
import editPostContext from "../context/editPost/editPostContext";

const PostMain = (props) => {
  const EditPostContext = useContext(editPostContext);

  const [starred, setStarred] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    const commentsRef = firestore.collection("posts").doc(id).collection("comments");
    try {
      //Borrar el post
      await firestore.collection("posts").doc(id).delete();

      //Redirigir al home al borrar el post
      props.history.push("/");
      
      //Borrar la id del post del documento del usuario que lo creó
      const userRef = firestore.collection("users").doc(props.user.uid)
      const userSnap = await userRef.get()
      const userPosts = userSnap.data().posts
      const deletedPostIndex = userPosts.indexOf(id)
      userPosts.splice(deletedPostIndex, 1) 
      await userRef.update({posts: userPosts})

      // Borrar los comentarios asociados al post que se eliminó
      let commentsDocs = []
      const commentsIds = []
      const deleteCommentsPromises = []

      commentsRef.get()
      .then((snap) => {
        commentsDocs = snap.docs
      })
      .then(() => {
        commentsDocs.forEach(doc => commentsIds.push(doc.id))
        commentsIds.forEach(commentId => deleteCommentsPromises.push(commentsRef.doc(commentId).delete()))
        Promise.all(deleteCommentsPromises).then(() => console.log("Comments should now be removed"))
      })    
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

  // Enviar al context la data del post a editar
  const editPostHandler = async (id) => {
    try {
      EditPostContext.setPostLoading(true)
  
      const docRef = firestore.collection("posts").doc(id)
      const post = await docRef.get()
      const postData = post.data()
      
      EditPostContext.setPostContent({postId: id, postTitle: postData.title, postContent: postData.content})
      EditPostContext.setPostLoading(false)
  
      props.history.push("/create-post")
      
    } catch (error) {
      console.log(error)
    }
  }

  const hideModal = () => {
    setShowModal(false)
  }

  return (
    <section className="post-main">
      <ConfirmModal
        action={handleDelete}
        show={showModal}
        hide={hideModal}
        itemToDelete={props.post.id}
      />
      <article className="post-main__content">
        <h1 className="post-main__title">{props.post.title}</h1>
        <div className="post-main__info">
          <p className="post-main__info-author">
            <Link to={`/users/${props.post.user.uid}`}>Created by: {props.post.user.displayName}</Link>
          </p>
          <p className="post-main__info-category">Category: <Link to={`/post/category/${props.post.category}`}>{props.post.category}</Link></p>
          <p className="post-main__info-date">{moment(props.post.createdAt).calendar()}</p>
        </div>
        <div className="post-main__content">
          <p>{ReactHtmlParser(props.post.content)}</p>
        </div>
      </article>
      <div className="post-main__user-actions">
        <div className="post-main__likes">
          <p><i className="far fa-thumbs-up" /> {props.post.stars && props.post.stars.length}</p>
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
        <div className="post-main__buttons">
          {props.user && props.user.uid === props.post.user.uid &&
          <React.Fragment>
            <button className="delete" onClick={() => editPostHandler(props.post.id)}>Edit post</button>
            <button className="delete" onClick={() => setShowModal(true)}>Delete post</button>
          </React.Fragment>
          }
        </div>
      </div>
    </section>
  );
}

export default WithUser(withRouter(PostMain));
