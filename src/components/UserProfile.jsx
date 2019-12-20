import React, { Component } from 'react';
import {firestore, auth} from "../firebase";

class UserProfile extends Component {
  state = {
    displayName: ""
  }

  imageInputRef = React.createRef();

  get uid() {
    return auth.currentUser.uid
  }

  get userRef() {
    return firestore.collection("users").doc(this.uid)
  }

  onChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  onSubmitHandler = async (e) => {
    e.preventDefault();
    if(this.state.displayName) {
      try {
        await this.userRef.update({displayName: this.state.displayName})
        this.setState({
          displayName: ""
        })
      } catch (error) {
        console.log(error)        
      }
    }
  }

  render() {
    return (
      <section className="UserProfile">
        <form onSubmit={this.onSubmitHandler}>
          <input
            type="text"
            value={this.state.displayName}
            name="displayName"
            onChange={this.onChangeHandler}
            placeholder="Username"
          />
          <input
            type="file"
            ref={this.imageInputRef}
          />
          <input
            type="submit"
            className="update"
            value="Update profile"
          />
        </form>
      </section>
    );
  }
}

export default UserProfile;

