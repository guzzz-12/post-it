import React, { Component } from 'react';
import {firestore, auth, getUserDoc} from "../firebase";
import DisplayErrors from './DisplayErrors';
import {UserContext} from "../providers/UserProvider";

class AddPost extends Component {
  state = {
    title: '',
    content: '',
    userRef: null,
    error: {
      status: false,
      type: null,
      message: null
    }
  };

  static contextType = UserContext;

  componentDidMount() {
    if(auth.currentUser) {
      this.setState({
        userRef: firestore.collection("users").doc(auth.currentUser.uid)
      })
    }
  }

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
        commentsUsers: [],
        comments: 0,
        createdAt: Date.now(),
      }

      try {
        const newPost = await firestore.collection("posts").add(post);      
        this.setState({
          title: "",
          content: "",
          error: {}
        })

        const userSnap = await this.state.userRef.get()
        const userPosts = userSnap.data().posts
        userPosts.push(newPost.id)

        await this.state.userRef.update({posts: userPosts})

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
        <h2>Create post</h2>
        <input
          className={`${error.status ? "input-validation-error" : ""}`}
          type="text"
          name="title"
          placeholder="Title"
          value={title}
          onChange={this.handleChange}
        />
        <textarea
          className={`${error.status ? "input-validation-error" : "post-content"}`}
          name="content"
          placeholder="Post content"
          cols="30"
          rows="5"
          value={content}
          onChange={this.handleChange}
        />
        <input
          disabled={!user || error.status || !user.emailVerified ? true : false}
          className="create"
          type="submit"
          value={user && user.emailVerified ? "Create Post" : user && !user.emailVerified ? "Verify your account to create posts" : "Login to create posts!"}
        />
      </form>
    );
  }
}

export default AddPost;
