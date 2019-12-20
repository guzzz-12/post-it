import React, { Component } from 'react';
import {firestore, auth, getUserDoc} from "../firebase";
import DisplayErrors from './DisplayErrors';
import {UserContext} from "../providers/UserProvider";

class AddPost extends Component {
  state = {
    title: '',
    content: '',
    error: {
      status: false,
      type: null,
      message: null
    }
  };

  static contextType = UserContext;

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      error: {
        status: false,
        type: null,
        message: null
      }
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { title, content } = this.state;

    let post = {};

    if(auth.currentUser && this.isFormValid({title, content})) {
      const author = await getUserDoc(auth.currentUser.uid)
      post = {
        title,
        content,
        user: {
          uid: author.uid,
          displayName: author.displayName,
          email: author.email,
          photoURL: author.photoURL,
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
            status: true,
            type: "postSubmit",
            message: error.message
          }
        }, () => this.clearErrorMessage())
      }
    }
  };

  isFormValid = (data) => {
    if(data.title === "" && data.content === "") {
      this.setState({
        error: {
          status: true,
          type: "emptyFields",
          message: "You must complete all fields"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.title === "") {
      this.setState({
        error: {
          status: true,
          type: "postTitle",
          message: "You must provide the title"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.content === "") {
      this.setState({
        error: {
          status: true,
          type: "postContent",
          message: "You must provide the content"
        }
      }, () => this.clearErrorMessage())
      return false
    }
    return true
  }

  clearErrorMessage = () => {
    setTimeout(() => {
      this.setState({
        error: {
          ...this.state.error,
          status: false
        }
      })
    }, 3500)
  }
  
  render() {
    let user = this.context;
    const { title, content, error } = this.state;
    return (
      <form
        onSubmit={this.handleSubmit}
        className="AddPost"
        style={{position: "relative"}}
      >
        <DisplayErrors error={error} />
        <input
          className={`${error.status ? "input-validation-error" : ""}`}
          type="text"
          name="title"
          placeholder="Title"
          value={title}
          onChange={this.handleChange}
        />
        <input
          className={`${error.status ? "input-validation-error" : ""}`}
          type="text"
          name="content"
          placeholder="Body"
          value={content}
          onChange={this.handleChange}
        />
        <input
          disabled={!user || error.status ? true : false}
          className="create"
          type="submit"
          value={user ? "Create Post" : "Login to create a post!"}
        />
      </form>
    );
  }
}

export default AddPost;
