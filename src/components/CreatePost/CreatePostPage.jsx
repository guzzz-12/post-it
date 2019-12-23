import React, {useState, useEffect, useContext} from "react";
import {UserContext} from "../../providers/UserProvider";
import {firestore, auth, getUserDoc} from "../../firebase";
import {withRouter} from "react-router-dom";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DisplayErrors from "../DisplayErrors";
import "./createPostPage.scss";

const CreatePostPage = (props) => {
  const user = useContext(UserContext);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [userRef, setUserRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    type: null,
    message: null
  })

  useEffect(() => {
    if(auth.currentUser) {
      setUserRef(firestore.collection("users").doc(auth.currentUser.uid))
    }
    // eslint-disable-next-line
  }, [auth.currentUser])

  const onTitleChangeHandler = (e) => {
    setPostTitle(e.target.value)
  }

  const onContentChangeHandler = (e, editor) => {
    setError({
      status: false,
      type: null,
      message: null
    })

    let postContent = editor.getData();
    setPostContent(postContent)
  }

  const handleSubmit = async () => {
    let post = {};
    let newPostId = null;

    if(auth.currentUser && isFormValid({postTitle, postContent})) {
      setLoading(true);

      const author = await getUserDoc(auth.currentUser.uid)
      post = {
        title: postTitle,
        content: postContent,
        user: {
          uid: author.uid,
          displayName: author.displayName,
          email: author.email,
          photoURL: author.photoURL,
        },
        stars: [],
        commentsUsers: [],
        comments: 0,
        createdAt: Date.now(),
      }

      //Crear el nuevo post
      try {
        const newPost = await firestore.collection("posts").add(post);
        newPostId = newPost.id;
        
        setError({
          title: "",
          content: "",
          error: {}
        })

        //Agregar id del nuevo post al documento del usuario
        const userSnap = await userRef.get()
        const userPosts = userSnap.data().posts
        userPosts.push(newPost.id)

        await userRef.update({posts: userPosts})
        setLoading(false);

        //Redirigir a la página del nuevo post
        props.history.push(`/post/${newPostId}`)

      } catch (error) {
        console.log(error)
        setError({
          status: true,
          type: "postSubmit",
          message: error.message
        })
        clearErrorMessage()
      }
    }
  };

  //Validar que se haya completado la información requerida para crear el post
  const isFormValid = (data) => {
    if(data.title === "" && data.content === "") {
      setError({
        status: true,
        type: "emptyFields",
        message: "You must complete all fields"
      })

      clearErrorMessage()
      return false

    } else if(data.title === "") {
      setError({
        status: true,
        type: "postTitle",
        message: "You must provide the title"
      })

      clearErrorMessage()
      return false

    } else if(data.content === "") {
      setError({
        status: true,
        type: "postContent",
        message: "You must provide the content"
      })
      
      clearErrorMessage()
      return false
    }
    return true
  }

  const clearErrorMessage = () => {
    setTimeout(() => {
      setError({
        ...error,
        status: false
      })
    }, 3500)
  }

  return (
    <section className="create-post-page">
      <DisplayErrors error={error} />
      <h2 className="create-post-page__header">Create new post</h2>
      <div className="create-post-page__data">
        <form
          className="create-post-page__title-input"
          style={{position: "relative"}}
        >
          <input
            className={`${error.status ? "input-validation-error" : ""}`}
            type="text"
            name="title"
            placeholder="Post title"
            value={postTitle}
            onChange={onTitleChangeHandler}
          />
        </form>
        <h2>Post content:</h2>
        <CKEditor
          editor={ClassicEditor}
          onChange={onContentChangeHandler}
        />
      </div>
      <input
        onClick={handleSubmit}
        disabled={!user || loading || postContent === "" || postTitle === "" || error.status || !user.emailVerified ? true : false}
        className="create-post-page__submit-post"
        type="submit"
        value={loading ? "Submitting..." : user && user.emailVerified ? "Create Post" : user && !user.emailVerified ? "Verify your account to create posts" : "Login to create posts!"}
      />
    </section>
  );
}

export default withRouter(CreatePostPage);
