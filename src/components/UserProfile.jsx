import React, { Component } from "react";
import {firestore, auth, storage} from "../firebase";
import {withRouter} from "react-router-dom";
import WithUser from "./WithUser";
import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import DisplayErrors from "./DisplayErrors";
import ConfirmModal from "./ConfirmModal/ConfirmModal";

class UserProfile extends Component {  
  
  state = {
    displayName: "",
    imgFile: "",
    uploading: false,
    updatingName: false,
    showModal: false,
    currentUserUid: null,
    error: {
      status: false,
      type: null,
      message: null
    }
  }
  
  componentDidMount() {
    document.title = "Post It! | Your Profile"
    if(!auth.currentUser) {
      this.props.history.push("/")
    } else {
      this.setState({
        currentUserUid: auth.currentUser.uid
      })
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
          updatingName: false,
          error: {
            status: true,
            type: "displayname",
            message: error.message
          }
        }, () => () => this.clearErrorMessage())       
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
          uploading: false,
          error: {
            status: true,
            type: "imageUploading",
            message: error.message
          }
        }, () => () => this.clearErrorMessage())
        console.log(error)
      }
    }
  }

  deletUserAccount = async (userId) => {
    const userPhotoUrl = this.props.user.photoURL;
    const postsRef = await firestore.collection("posts").where("user.uid", "==", userId).get()
    const deletePostsPromises = []

    try {
      // Borrar perfil del usuario
      await this.userRef.delete()

      // Borrar avatar del storage
      if(!userPhotoUrl.toLowerCase().includes("gravatar")) {
        await storage.ref()
        .child("user-profiles")
        .child(userId)
        .child(userId)
        .delete()
      }
  
      // Borrar posts del usuario
      postsRef.forEach(post => {
        deletePostsPromises.push(post.ref.delete())
      })
      
      if(deletePostsPromises.length > 0) {
        await Promise.all(deletePostsPromises)
      }
  
      // Borrar cuenta del usuario
      await auth.currentUser.delete()
      
    } catch (error) {
      this.setState({
        error: {
          status: true,
          type: "deleteAccount",
          message: error.message
        }
      }, () => {
        this.hideModal()
        this.clearErrorMessage()
      })
      console.log(error)
    }
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

  hideModal = () => {
    this.setState({
      showModal: false
    })
  }

  render() {
    return (
      <div className="generic-wrapper">
        {!this.state.error.status && 
          <ConfirmModal
            show={this.state.showModal}
            hide={this.hideModal}
            action={this.deletUserAccount}
            itemToDelete={this.state.currentUserUid}
          />
        }
        <DisplayErrors error={this.state.error} />
        <UserInfo user={this.props.user} />
        <section className="profile-form" style={{marginBottom: "2rem"}}>
          <h2>Update your profile</h2>
          <form onSubmit={this.onSubmitHandler}>
            <div className="profile-form__username">
              <input
                type="text"
                value={this.state.displayName}
                name="displayName"
                onChange={this.onChangeHandler}
                placeholder="Update username"
              />
            </div>
            <div>
              <label
                className="profile-form__upload-btn"
                htmlFor="upload-image"
              >
                {`${(this.state.imgFile && "File: " + this.state.imgFile.split('\\')[2]) || "Choose new avatar"}`}
              </label>
            </div>
            <input
              style={{display: "none"}}
              type="file"
              id="upload-image"
              ref={this.imageInputRef}
              name="imgFile"
              onChange={this.onChangeHandler}
              value={this.state.imgFile}
              accept="image/png, image/jpeg"
            />
            <input
              type="submit"
              className="update"
              id="update"
              disabled={this.state.uploading || this.state.updatingName || !this.state.displayName && !this.state.imgFile}
              value={
                this.state.uploading ? "Updating avatar..." :
                this.state.updatingName ? "Updating name..." :
                "Update profile"
              }
            />
          </form>
        </section>
        <button onClick={() => this.setState({showModal: true})}>Delete your account</button>
        <UserPosts user={this.props.user} />
      </div>
    );
  }
}

export default WithUser(withRouter(UserProfile));

