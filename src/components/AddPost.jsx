import React, { Component } from 'react';
import {firestore, auth} from "../firebase";

class AddPost extends Component {
  state = {
    title: '',
    content: '',
    error: {}
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value, error: {} });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { title, content } = this.state;

    let post = {};

    if(auth.currentUser && this.isFormValid({title, content})) {
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

      try {
        await firestore.collection("posts").add(post);      
        this.setState({
          title: "",
          content: "",
          error: {}
        })
      } catch (error) {
        console.log(error)
        this.setState({
          error: {
            type: "postSubmit",
            message: error.message
          }
        })
      }
    }
  };

  isFormValid = (data) => {
    if(data.title === "" && data.content === "") {
      this.setState({
        error: {
          type: "emptyFields",
          message: "You must complete all fields"
        }
      })
      return false
    } else if(data.title === "") {
      this.setState({
        error: {
          type: "postTitle",
          message: "You must provide the title"
        }
      })
      return false
    } else if(data.content === "") {
      this.setState({
        error: {
          type: "postContent",
          message: "You must provide the content"
        }
      })
      return false
    }
    return true
  }
  
  render() {
    const {error} = this.state;
    const { title, content } = this.state;
    return (
      <form onSubmit={this.handleSubmit} className="AddPost">
        <input
          className={`${error.type === "postTitle" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
          type="text"
          name="title"
          placeholder={`${error.type === "postTitle" || error.type === "emptyFields" ? error.message : "Title"}`}
          value={title}
          onChange={this.handleChange}
        />
        <input
          className={`${error.type === "postContent" || error.type === "emptyFields" ? "input-validation-error" : ""}`}
          type="text"
          name="content"
          placeholder={`${error.type === "postContent" || error.type === "emptyFields" ? error.message : "Body"}`}
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
