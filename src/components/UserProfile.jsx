import React, { Component } from "react";
import {firestore, auth, storage} from "../firebase";
import {withRouter} from "react-router-dom";
import WithUser from "./WithUser";
import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";

class UserProfile extends Component {
  state = {
    displayName: "",
    imgFile: "",
    uploading: false,
    updatingName: false
  }

  componentDidMount() {
    if(!auth.currentUser) {
      this.props.history.push("/")
    }
  }

  imageInputRef = React.createRef();

  get uid() {
    return auth.currentUser.uid
  }

  get userRef() {
    return firestore.collection("users").doc(this.uid)
  }

  get file() {
    return this.imageInputRef && this.imageInputRef.current.files[0]
  }

  onChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  onSubmitHandler = async (e) => {
    e.preventDefault();
    if(this.state.displayName) {
      this.setState({
        updatingName: true
      })

      try {
        await this.userRef.update({displayName: this.state.displayName})
        this.setState({
          displayName: "",
          updatingName: false
        })
      } catch (error) {
        console.log(error)
        this.setState({
          updatingName: false
        })       
      }
    }

    if(this.file) {
      try {
        this.setState({
          uploading: true
        })

        const fileName = this.uid
        const uploadResponse = await storage.ref()
          .child("user-profiles")
          .child(this.uid)
          .child(fileName)
          .put(this.file)

        const downloadURL = await uploadResponse.ref.getDownloadURL()

        await this.userRef.update({
          photoURL: downloadURL
        })

        this.setState({
          imgFile: "",
          uploading: false
        })

      } catch (error) {
        this.setState({
          imgFile: "",
          uploading: false
        })
        console.log(error)
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <UserInfo user={this.props.user} />
        <section className="profile-form">
          <h2>Update your profile</h2>
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
              name="imgFile"
              onChange={this.onChangeHandler}
              value={this.state.imgFile}
              accept="image/png, image/jpeg"
            />
            <input
              type="submit"
              className="update"
              disabled={this.state.uploading || this.state.updatingName}
              value={
                this.state.uploading ? "Updating avatar..." :
                this.state.updatingName ? "Updating name..." :
                "Update profile"
              }
            />
          </form>
        </section>
        <UserPosts user={this.props.user} />
      </React.Fragment>
    );
  }
}

export default WithUser(withRouter(UserProfile));

