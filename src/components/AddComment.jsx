import React, { Component } from "react";
import WithUser from "./WithUser";
import TexareaAutosize from "react-textarea-autosize";

class AddComment extends Component {
  state = {
    content: ""
  };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    event.preventDefault();
  };

  // Agregar el comentario al presionar Enter
  handleOnKeyDown = (event) => {
    if(event.keyCode === 13 && !event.shiftKey) {
      if(this.state.content.replace(/\s/g, "").length > 0) {
        this.props.onCreate(this.state)
        this.setState({ content: "" })
      }
    }
  }
  
  render() {
    const { content } = this.state;
    return (
      <div className="commentFormWrapper">
        <form onSubmit={this.handleSubmit} className="AddComment">
          <div className="AddComment__content-input-container">
            <div className="AddComment__content-input-img" style={{backgroundImage: `url(${(this.props.user && this.props.user.photoURL)})`, backgroundColor: "#ccc"}}></div>
            <TexareaAutosize
              id="AddComment__content-input"
              cols="30"
              rows="1"
              disabled={!this.props.user || (this.props.user && !this.props.user.emailVerified)}
              name="content"
              placeholder={`${this.props.user && !this.props.user.emailVerified ? "Verify your account to add comments..." : this.props.user ? "Add comment..." : "Login to comment..."}`}
              value={content}
              onChange={this.handleChange}
              onKeyDown={this.handleOnKeyDown}
            />
          </div>
        </form>
        <div className="commentForm__info">
          <p>Press Enter to add comment or Shift + Enter to add new line</p>
        </div>
      </div>
    );
  }
}

export default WithUser(AddComment);
