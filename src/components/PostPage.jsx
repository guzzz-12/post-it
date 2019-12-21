import React, { Component } from 'react';
import Post from "./Post";
import Comments from "./Comments";
import {firestore} from "../firebase";
import {collectIdsAndDocs} from "../utils";
import {withRouter} from "react-router-dom";
import WithUser from "./WithUser";

class PostPage extends Component {
  
  state = {
    post: null,
    comments: []
  }
  
  unsubscribeFromPost = null
  unsubscribeFromComments = null
  
  postsRef = firestore.collection("posts").doc(this.props.match.params.postId)
  
  commentsRef = this.postsRef.collection("comments")
  
  async componentDidMount() {
    try {
      this.unsubscribeFromPost = this.postsRef.onSnapshot((snapshot) => {
        if(!snapshot.exists) {
          this.props.history.push("/")
          return
        }

        const post = collectIdsAndDocs(snapshot)
        
        this.setState({
          post: post
        })
      })
      
    } catch (error) {
      console.log(error)
    }

    this.unsubscribeFromComments = this.commentsRef.onSnapshot((snapshot) => {
      const comments = snapshot.docs.map(doc => {
        return collectIdsAndDocs(doc)
      })
      this.setState({
        comments: comments
      })
    })
  }

  createComment = async (comment) => {
    const postCommentsUsersRef = await this.postsRef.get()
    const commentsUsersIds = postCommentsUsersRef.data().commentsUsers
    const commentsAmount = postCommentsUsersRef.data().comments
    
    if(!commentsUsersIds.includes(this.props.user.uid)) {
      commentsUsersIds.push(this.props.user.uid)
      
      await this.postsRef.update({commentsUsers: commentsUsersIds})
    }

    await this.commentsRef.add({
      user: this.props.user,
      createdAt: Date.now(),
      postID: this.props.match.params.postId,
      ...comment
    })

    await this.postsRef.update({comments: commentsAmount + 1})
  }

  deleteComment = async (id) => {
    const postCommentsUsersRef = await this.postsRef.get()
    const commentsAmount = postCommentsUsersRef.data().comments

    try {
      //Borrar el comentario
      await this.commentsRef.doc(id).delete()
      await this.postsRef.update({comments: commentsAmount - 1})

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
      }      
    } catch (error) {
      console.log(error)
    }
  }

  componentWillUnmount() {
    this.unsubscribeFromPost()
    this.unsubscribeFromComments()
  }
  
  render() {
    const {post, comments} = this.state;

    return (
      <section>
        {post && <Post {...post} />}
        <Comments
          comments={comments}
          postId={post && post.id}
          onCreate={this.createComment}
          onDelete={this.deleteComment}
          user={this.props.user}
        />
      </section>
    );
  }
}

export default withRouter(WithUser(PostPage));
