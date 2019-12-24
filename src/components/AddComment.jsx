import React, { Component } from "react";
import WithUser from "./WithUser";

class AddComment extends Component {
  state = { content: '' };

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.props.onCreate(this.state)

    this.setState({ content: '' });
  };

  render() {
    const { content } = this.state;
    return (
      <form onSubmit={this.handleSubmit} className="AddComment">
        <div className="AddComment__content-input-container">
          <div className="AddComment__content-input-img" style={{backgroundImage: `url(${this.props.user.photoURL})`}}></div>
          <input
            type="text"
            id="AddComment__content-input"
            disabled={this.props.user && !this.props.user.emailVerified}
            name="content"
            placeholder="Add comment..."
            value={content}
            onChange={this.handleChange}
          />
        </div>
      </form>
    );
  }
}

export default WithUser(AddComment);
