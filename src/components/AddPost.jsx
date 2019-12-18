import React, { Component } from 'react';
import {firestore, auth} from "../firebase";

class AddPost extends Component {
  state = {
    title: '',
    content: '',
    error: null
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { title, content } = this.state;

    let post = {};

    if(auth.currentUser) {
      post = {
        title,
        content,
        user: {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
        },
        stars: [],
        comments: 0,
        createdAt: new Date(),
      }
    }

    try {
      await firestore.collection("posts").add(post);      
      this.setState({
        title: "",
        content: "",
        error: null
      })
    } catch (error) {
      console.log(error)
      this.setState({
        error: error.message
      })
    }
  };
  
  render() {
    const { title, content } = this.state;
    return (
      <form onSubmit={this.handleSubmit} className="AddPost">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={title}
          onChange={this.handleChange}
        />
        <input
          type="text"
          name="content"
          placeholder="Body"
          value={content}
          onChange={this.handleChange}
        />
        <input
          disabled={!auth.currentUser ? true : false}
          className="create"
          type="submit"
          value={auth.currentUser ? "Create Post" : "Login to create a post!"}
        />
      </form>
    );
  }
}

export default AddPost;
