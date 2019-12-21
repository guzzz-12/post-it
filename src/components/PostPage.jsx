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
    
    if(!commentsUsersIds.includes(this.props.user.uid)) {
      commentsUsersIds.push(this.props.user.uid)
      
      await this.postsRef.update({commentsUsers: commentsUsersIds})
    }

    await this.commentsRef.add({
      user: this.props.user,
      createdAt: Date.now(),
      ...comment
    })
  }

  deleteComment = async (id) => {
    try {
      await this.commentsRef.doc(id).delete()      
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
