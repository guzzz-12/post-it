import React, { Component } from 'react';
import Comments from "./Comments";
import {auth, firestore} from "../firebase";
import {collectIdsAndDocs} from "../utils";
import {withRouter} from "react-router-dom";
import WithUser from "./WithUser";
import PostMain from "./PostMain";
import Spinner from './Spinner/Spinner';
import NotFound from "./NotFound/NotFound";

class PostPage extends Component {  
  state = {
    post: null,
    comments: [],
    sortedBy: "asc",
    commentsChanged: false,
    postNotFound: false
  }
  
  unsubscribeFromPost = null
  unsubscribeFromComments = null
  
  postsRef = firestore.collection("posts").doc(this.props.match.params.postId)  
  commentsRef = this.postsRef.collection("comments")
  
  async componentDidMount() {
    try {
      // Escuchar los cambios de la colección de posts para actualizar la interfaz en tiempo real
      this.unsubscribeFromPost = this.postsRef.onSnapshot(async (snapshot) => {
        if(!snapshot.exists) {
          this.setState({
            post: null,
            postNotFound: true
          })
        } else {
          const updatedPost = collectIdsAndDocs(snapshot)          
          this.setState({
            post: updatedPost,
            postNotFound: false
          })
        }
      })

      const post = await this.postsRef.get();
      if(post.exists) {
        this.setState({
          post: post.data(),
          postNotFound: false
        })
      } else {
        this.setState({
          post: null,
          postNotFound: true
        })
      }
      
    } catch (error) {
      console.log(error)
    }

    // Escuchar los cambios de la colección de comentarios para actualizar la interfaz en tiempo real
    this.unsubscribeFromComments = this.commentsRef.orderBy("createdAt", this.state.sortedBy).onSnapshot((snapshot) => {      
      const comments = snapshot.docs.map(doc => {
        return collectIdsAndDocs(doc)
      })
      
      this.setState({
        comments: comments
      })
    })
  }

  // Agregar comentario a la base de datos
  createComment = async (comment) => {
    // Agregar el comentario al post
    await this.commentsRef.add({
      user: {
        uid: this.props.user.uid,
        displayName: this.props.user.displayName,
        photoURL: this.props.user.photoURL,
        email: this.props.user.email
      },
      createdAt: Date.now(),
      postID: this.props.match.params.postId,
      ...comment
    })

    // Actualizar contador de comentarios en el post
    const commentsCollection = await this.commentsRef.get()
    await this.postsRef.update({comments: commentsCollection.size})

    // Actualizar la propiedad postsCommented del user para indicar que el usuario comentó el post
    const userRef = firestore.collection("users").doc(auth.currentUser.uid)
    await userRef.get().then((snapshot) => {
      const postsCommentedByUser = [...snapshot.data().postsCommented]

      if(!postsCommentedByUser.includes(this.props.match.params.postId)) {
        postsCommentedByUser.push(this.props.match.params.postId)
        userRef.update({postsCommented: postsCommentedByUser})
      }
    })

    // Agregar la id del usuario a la propiedad commentsUsers del post (si es la primera vez que comenta el post)
    const postCommentsUsersRef = await this.postsRef.get()
    const commentsUsersIds = postCommentsUsersRef.data().commentsUsers
    
    if(!commentsUsersIds.includes(this.props.user.uid)) {
      commentsUsersIds.push(this.props.user.uid)
      
      await this.postsRef.update({commentsUsers: commentsUsersIds})
    }

    // Actualizar el state
    this.setState({
      commentsChanged: true
    })
  }

  // Borrar comentario de la base de datos
  deleteComment = async (id) => {
    try {
      //Borrar el comentario
      await this.commentsRef.doc(id).delete()

      // Actualizar contador de comentarios en el post
      const commentsCollection = await this.commentsRef.get()
      await this.postsRef.update({comments: commentsCollection.size})

      this.setState({
        commentsChanged: true
      })

      //Eliminar la id del usuario de la propiedad commentsUsers del post cuando el usuario elimina todos sus comentarios
      const allComments = []
      let userComments = []
      const commentsRef = await this.commentsRef.get()

      commentsRef.forEach(comment => allComments.push(comment.data()))
      userComments = allComments.filter(comment => comment.user.uid === this.props.user.uid)

      if(userComments.length === 0) {
        const postCommentsUsersRef = await this.postsRef.get()
        let commentsUsersIds = postCommentsUsersRef.data().commentsUsers

        const userIdIndex = commentsUsersIds.indexOf(this.props.user.uid)
        commentsUsersIds.splice(userIdIndex, 1)

        await this.postsRef.update({commentsUsers: commentsUsersIds})

        // Eliminar la id del post de la propiedad postsCommented del user
        const userRef = firestore.collection("users").doc(auth.currentUser.uid)
        userRef.get().then((snapshot) => {
          const postsCommentedByUser = [...snapshot.data().postsCommented]
          userRef.update({
            postsCommented: postsCommentedByUser.filter(id => id !== this.props.match.params.postId)
          })
        })
      }      
    } catch (error) {
      console.log(error)
    }
  }

  // Ordenar comentarios en el cliente, no se ejecuta un nuevo query
  sortCommentsHandler = (sortBy) => {
    if(sortBy === "asc") {
      const compare = ( a, b ) => {
        if ( a.createdAt < b.createdAt ){
          return -1;
        }
        if ( a.createdAt > b.createdAt ){
          return 1;
        }
        return 0;
      }

      const sorted = [...this.state.comments].sort(compare)
      this.setState({
        comments: sorted,
        commentsChanged: false,
      })
    } else if(sortBy === "desc") {
      const compare = ( a, b ) => {
        if ( a.createdAt > b.createdAt ){
          return -1;
        }
        if ( a.createdAt < b.createdAt ){
          return 1;
        }
        return 0;
      }

      const sorted = [...this.state.comments].sort(compare)
      this.setState({
        comments: sorted,
        commentsChanged: false
      })
    }
  }

  // Resetear el sort al agregar o eliminar comentarios
  resetCommentsChanged = () => {
    this.setState({
      commentsChanged: false
    })
  }

  // Desuscribirse de los listeners al salir de la página
  componentWillUnmount() {
    this.unsubscribeFromPost()
    this.unsubscribeFromComments()
  }
  
  render() {    
    const {post, comments, postNotFound} = this.state;

    document.title = `Post It! ${!post ? "" : `| ${post.title}`}`

    return (
      <section className="generic-wrapper">
        {!post && !postNotFound && <Spinner />}
        {!post && postNotFound && <NotFound />}
        {post && !postNotFound &&
          <React.Fragment>
            <PostMain post={post} />
            <Comments
              comments={comments}
              postId={post && post.id}
              user={this.props.user}
              onCreate={this.createComment}
              onDelete={this.deleteComment}
              sortComments={this.sortCommentsHandler}
              commentsChanged={this.state.commentsChanged}
              resetCommentsChanged={this.resetCommentsChanged}
            />
          </React.Fragment>
        }
      </section>
    );
  }
}

export default withRouter(WithUser(PostPage));
