import React, {useState, useEffect, useContext} from "react";
import {UserContext} from "../../providers/UserProvider";
import editPostContext from "../../context/editPost/editPostContext";
import {firestore, auth, getUserDoc} from "../../firebase";
import {withRouter} from "react-router-dom";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DisplayErrors from "../DisplayErrors";
import "./createPostPage.scss";

const CreatePostPage = (props) => {
  document.title = "Post It! | Create Post"

  const user = useContext(UserContext);
  const EditPostContext = useContext(editPostContext);
  const editorsWrapperRef = React.createRef()
  
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("science");
  const [editMode, setEditMode] = useState(false);
  const [userRef, setUserRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    type: null,
    message: null
  })

  // Limpiar contenido del post al salir de la página
  useEffect(() => {
    return () => {
      EditPostContext.clearPostContent()
    }
    // eslint-disable-next-line
  }, [])
  
  // Crear el editor para editar posts cuando se entra en modo edición
  useEffect(() => {
    if(EditPostContext.postTitle && EditPostContext.postContent) {
      setEditMode(true)
      setPostTitle(EditPostContext.postTitle)
      setPostCategory(EditPostContext.postCategory)
      setPostContent(EditPostContext.postContent)

      // Ocultar el editor para creación de posts cuando se entra en modo edición
      if(editorsWrapperRef.current) {
        const editors = editorsWrapperRef.current.children
        const editorsArray = Array.from(editors)
        editorsArray.forEach((el, i) => {
          el.style.display = "none"
        })
      }
      
      // Editor de edición
      ClassicEditor.create(document.querySelector("#editor"), {
        mediaEmbed: {
          previewsInData: true
        }
      })
      .then((editor) => {
        editor.setData(postContent)
        window.editor = editor
      })
      .catch((err) => console.log(err))
    }

    if(auth.currentUser) {
      setUserRef(firestore.collection("users").doc(auth.currentUser.uid))
    }

    // eslint-disable-next-line
  }, [auth.currentUser, EditPostContext, postContent])

  const onTitleChangeHandler = (e) => {
    setPostTitle(e.target.value)
  }

  const categoryHandler = (e) => {
    setPostCategory(e.target.value)
  }

  const onContentChangeHandler = (e, editor) => {
    setError({
      status: false,
      type: null,
      message: null
    })

    let content = editor.getData();
    setPostContent(content)
  }

  const handleSubmit = async () => {
    let post = {};
    let newPostId = null;

    if(auth.currentUser && isFormValid({postTitle, postContent})) {
      setLoading(true);

      const author = await getUserDoc(auth.currentUser.uid)
      const titleArray = postTitle.toLowerCase().split(" ")
      post = {
        title: postTitle,
        titleArray,
        category: postCategory,
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

  // Editar el post
  const editPostHandler = async () => {
    try {
      const postRef = firestore.collection("posts").doc(EditPostContext.postId)
      const titleArray = postTitle.toLowerCase().split(" ")
      await postRef.update({title: postTitle, titleArray, category: postCategory, content: window.editor.getData()})
      setEditMode(false)
      EditPostContext.clearPostContent()
      props.history.push(`/post/${EditPostContext.postId}`)
      
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

  // Cancelar edición del post
  const cancelEdit = () => {
    props.history.goBack()
  }

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

  // Limpiar mensajes de error después de 3.5 segundos
  const clearErrorMessage = () => {
    setTimeout(() => {
      setError({
        ...error,
        status: false
      })
    }, 3500)
  }

  return (
    <section className="create-post-page generic-wrapper">
      <DisplayErrors error={error} />
      <div className="create-post-page__header-content">
        <h2 className="create-post-page__header">{editMode ? "Edit post" : "Create new post"}</h2>
        {editMode && <span onClick={cancelEdit}>Cancel editing</span>}
      </div>
      <div className="create-post-page__data">
        <form
          className="create-post-page__title-input"
          style={{position: "relative"}}
        >
          <input
            className={`${error.status ? "input-validation-error" : ""}`}
            type="text"
            name="title"
            placeholder="Post title (30 words max.)"
            value={postTitle}
            maxLength={30}
            onChange={onTitleChangeHandler}
          />
          {/* Categorías de los posts */}
          <div className="create-post-page__post-category">
            <h2>Post category:</h2>
            <div className="post-categories">
              <div className="post-category post-category--science">
                <label
                  htmlFor="science"
                  style={{backgroundColor: `${postCategory === "science" ? "#4791f1" : "#ccc"}`}}
                >
                  Science
                </label>
                <input type="radio" checked={postCategory === "science"} name="category" id="science" value="science" onClick={categoryHandler}/>
              </div>
              <div className="post-category post-category--technology">
                <label
                  htmlFor="technology"
                  style={{backgroundColor: `${postCategory === "technology" ? "#4791f1" : "#ccc"}`}}
                >
                  Technology
                </label>
                <input type="radio" checked={postCategory === "technology"} name="category" id="technology" value="technology"  onClick={categoryHandler}/>
              </div>
              <div className="post-category post-category--development">
                <label
                  htmlFor="development"
                  style={{backgroundColor: `${postCategory === "development" ? "#4791f1" : "#ccc"}`}}
                >
                  Development
                </label>
                <input type="radio" checked={postCategory === "development"} name="category" id="development" value="development"  onClick={categoryHandler}/>
              </div>
              <div className="post-category post-category--other">
                <label
                  htmlFor="other"
                  style={{backgroundColor: `${postCategory === "other" ? "#4791f1" : "#ccc"}`}}
                >
                  Other
                </label>
                <input type="radio" checked={postCategory === "other"} name="category" id="other" value="other"  onClick={categoryHandler}/>
              </div>
            </div>
          </div>
        </form>
        <h2>Post content:</h2>
        <div ref={editorsWrapperRef} className="editors-wrapper">
          <div id="editor"></div>
          <CKEditor
            editor={ClassicEditor}
            config={{
              mediaEmbed: {
                previewsInData: true
              }
            }}
            onChange={onContentChangeHandler}
          />
        </div>
      </div>
      <input
        onClick={!editMode ? handleSubmit : editPostHandler}
        disabled={!user || loading || postContent === "" || postTitle === "" || error.status || !user.emailVerified ? true : false}
        className="create-post-page__submit-post"
        type="submit"
        value={
          loading ? "Submitting..." :
          user && user.emailVerified && !editMode ? "Create Post" :
          user && user.emailVerified && editMode ? "Edit Post" :
          user && !user.emailVerified ? "Verify your account to create posts" :
          "Login to create posts!"}
      />
    </section>
  );
}

export default withRouter(CreatePostPage);
