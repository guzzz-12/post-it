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
        <input
          type="text"
          disabled={this.props.user && !this.props.user.emailVerified}
          name="content"
          placeholder="Add comment"
          value={content}
          onChange={this.handleChange}
        />
        <input
          disabled={this.props.user && !this.props.user.emailVerified}
          className="create"
          type="submit"
          value={`${this.props.user && !this.props.user.emailVerified ?
            "Verify your account to add comments" : "Add comment"}`}
        />
      </form>
    );
  }
}

export default WithUser(AddComment);
