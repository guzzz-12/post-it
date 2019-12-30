import React, {useState, useEffect, useContext} from "react";
import moment from "moment";
import {firestore, auth} from "../firebase";
import {UserContext} from "../providers/UserProvider";
import {Link, withRouter} from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import ConfirmModal from "./ConfirmModal/ConfirmModal";

const PostPreview = ({id, title, category, content, user, createdAt, stars, comments, history, location}) => {
  const userfromContext = useContext(UserContext);

  const [starred, setStarred] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [marginBottom, setMarginBottom] = useState("0.5rem");
  // const [flexDirection, setFlexDirection] = useState(null)

  useEffect(() => {
    if((window.innerWidth > 700 && auth.currentUser) || (window.innerWidth > 700 && !auth.currentUser)) {
      setMarginBottom(0)
    } else if(window.innerWidth <= 700 && auth.currentUser) {
      setMarginBottom("0.5rem")
    } else if(window.innerWidth <= 700 && !auth.currentUser) {
      setMarginBottom(0)
    }
    
    window.addEventListener("resize", (e) => {
      if((e.target.innerWidth > 700 && auth.currentUser) || (e.target.innerWidth > 700 && !auth.currentUser)) {
        setMarginBottom(0)
      } else if(e.target.innerWidth <= 700 && auth.currentUser) {
        setMarginBottom("0.5rem")
      } else if(e.target.innerWidth <= 700 && !auth.currentUser) {
        setMarginBottom(0)
      }
    })
  }, [])


  
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
    const commentsRef = firestore.collection("posts").doc(id).collection("comments");
    try {
      //Borrar el post
      await firestore.collection("posts").doc(id).delete();

      //Borrar la id del post del documento del usuario que lo creó
      const userRef = firestore.collection("users").doc(userfromContext.uid)
      const userSnap = await userRef.get()
      const userPosts = userSnap.data().posts
      const deletedPostIndex = userPosts.indexOf(id)
      userPosts.splice(deletedPostIndex, 1)      
      await userRef.update({posts: userPosts})
      
      setStarred(false)

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
        Promise.all(deleteCommentsPromises).then(() => console.log("Post comments removed"))
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

  const reducePostContent = () => {
    const contentArray = content.split(" ")
    const reducedContent = contentArray.splice(0, 60).join(" ")
    return `${reducedContent}... [Click to continue reading...]`
  }

  const hideModal = () => {
    setShowModal(false);
  }

  return (
    <article className="Post">
      <ConfirmModal
        action={handleDelete}
        show={showModal}
        hide={hideModal}
        itemToDelete={id}
      />
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
            <div>{ReactHtmlParser(reducePostContent())}</div>
          </div>
        </div>
      </Link>
      <div className="Post--meta">
        <div
          className="Post--meta__content"
          style={{marginBottom: marginBottom, alignItems: `${!auth.currentUser ? "center" : "flex-start"}`}}
        >
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
          <p style={{textTransform: "capitalize"}}>Category: <Link to={`/post/category/${category}`}>{category}</Link></p>
        </div>
        <div className="Post--meta__buttons">
          {userfromContext && userfromContext.uid === user.uid &&
            <button
              style={{color: "#fff"}}
              className="delete"
              onClick={() => setShowModal(true)}
            >
              Delete
            </button>
          }
          {userfromContext &&
            <button
              className="star"
              onClick={!starred ? () => addStar(id) : () => removeStar(id)}
            >
              {starred ?
                <span style={{color: "#fff"}}>Dislike <i className="far fa-thumbs-down"></i></span>
                :
                <span style={{color: "#fff"}}>Like <i className="far fa-thumbs-up"></i></span>
              }
            </button>
          }
        </div>
      </div>
    </article>
  );
};

export default withRouter(PostPreview);
