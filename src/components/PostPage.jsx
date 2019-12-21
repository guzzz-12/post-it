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
    await this.commentsRef.add({
      user: this.props.user,
      createdAt: Date.now(),
      ...comment
    })
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
          user={this.props.user}
        />
      </section>
    );
  }
}

export default withRouter(WithUser(PostPage));
