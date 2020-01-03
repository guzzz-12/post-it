import React, { Component } from "react";
import bcryptjs from "bcryptjs";
import firebase from "../firebase";
import {firestore, auth, storage} from "../firebase";
import {withRouter} from "react-router-dom";
import WithUser from "./WithUser";
import UserInfo from "./UserInfo";
import UserPosts from "./UserPosts";
import DisplayErrors from "./DisplayErrors";
import DeleteAccount from "./DeleteAccountModal/DeleteAccount";

class UserProfile extends Component {  
  
  state = {
    displayName: "",
    imgFile: "",
    imgFilePreview: "",
    userPassword: "",
    newUserPassword: "",
    confirmNewUserPassword: "",
    changeUserPasswordSuccess: false,
    securityPassword: "",
    currentSecurityPassword: "",
    confirmSecurityPassword: "",
    securityPasswordSuccess: false,
    uploading: false,
    updatingName: false,
    showModal: false,
    showDeleteAccountModal: false,
    currentUserUid: null,
    loading: false,
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


  // Almacenar en el state los valores de los campos de los formularios
  onChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  
  // Guardar en el state la data de la imagen de avatar seleccionada
  onImageChangeHandler = (e) => {
    this.setState({
      imgFilePreview: URL.createObjectURL(e.target.files[0]),
      imgFile: e.target.value
    })  
  }

  // Procesar los formularios
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
          imgFilePreview: "",
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

  // Funcionalidad para borrar la cuenta del usuario y todos sus datos asociados
  // Aún falta la funcionalidad para eliminar todos los comentarios del usuario al eliminar su cuenta
  deletUserAccount = async (userId) => {
    const userPhotoUrl = this.props.user.photoURL;
    const postsRef = await firestore.collection("posts").where("user.uid", "==", userId).get()
    const deletePostsPromises = []

    try {
      // Borrar avatar del storage
      if(userPhotoUrl.toLowerCase().includes("firebasestorage")) {
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

      // Borrar perfil del usuario
      await this.userRef.delete()

      // Borrar cuenta del usuario
      await auth.currentUser.delete()

      this.setState({
        showModal: false,
        showDeleteAccountModal: false
      })

      // Redirigir al home
      this.props.history.push("/")
      
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

  hideModal = () => {
    this.setState({
      showModal: false
    })
  }

  hideDeleteAccountModal = () => {
    this.setState({
      showDeleteAccountModal: false
    })
  }

  // Funcionalidad para cambiar la contraseña de usuarios autenticados con email/password
  userPasswordHandler = async (e) => {
    e.preventDefault()
    const data = {
      userPassword: this.state.userPassword,
      newUserPassword: this.state.newUserPassword,
      confirmNewUserPassword: this.state.confirmNewUserPassword
    }
    if(this.isFormValid(data)) {
      this.setState({
        loading: true
      })

      try {
        // Chequear crendenciales del usuario
        const credential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, data.userPassword);
        await auth.currentUser.reauthenticateWithCredential(credential);

        // Cambiar la contraseña y notificar al usuario si todo es correcto
        const user = auth.currentUser;
        await user.updatePassword(data.newUserPassword);

        this.setState({
          changeUserPasswordSuccess: true
        }, () => {
          setTimeout(() => {
            this.setState({
              userPassword: "",
              newUserPassword: "",
              confirmNewUserPassword: "",
              changeUserPasswordSuccess: false,
              loading: false
            })
          }, 3500)
        })
        
      } catch (error) {
        console.log(error)
        window.scrollTo({top: 0});
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "submit",
            message: error.code.includes("wrong-password") ? "Wrong password, try again" : error.message
          }
        }, () => this.clearErrorMessage())
      }
    } 
  }

  // Funcionalidad para crear o modificar la contraseña de seguridad (Sólo para usuarios de google provider)
  securityPasswordHandler = async (e) => {
    e.preventDefault()

    try {
      //Chequear si el usuario ya creó su contraseña de seguridad
      if(this.props.user.securityPassword) {
        this.setState({
          loading: true
        })

        const check = await this.compareSecurityPasswords()

        if(!check) {
          this.setState({
            currentSecurityPassword: "",
            loading: false,
            error: {
              status: true,
              type: "currentPassword",
              message: "Wrong password"
            }
          }, () => {
            window.scrollTo({top: 0});
            this.hideModal()
            this.clearErrorMessage()
          })
          return false  
        }
      }
      
      // Crear o actualizar la contraseña de seguridad
      if(!this.state.securityPassword && !this.setState.confirmSecurityPassword) {
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "emptyFields",
            message: "You must complete all fields"
          }
        }, () => {
          window.scrollTo({top: 0});
          this.hideModal()
          this.clearErrorMessage()
        })
        return false
      } else if(this.state.securityPassword === "") {
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "securityPassword",
            message: "You must complete all fields"
          }
        }, () => {
          window.scrollTo({top: 0});
          this.hideModal()
          this.clearErrorMessage()
        })
        return false
      } else if(this.state.confirmSecurityPassword === "") {
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "confirmSecurityPassword",
            message: "You must complete all fields"
          }
        }, () => {
          window.scrollTo({top: 0});
          this.hideModal()
          this.clearErrorMessage()
        })
        return false
      } else if(this.state.securityPassword !== this.state.confirmSecurityPassword) {
        this.setState({
          loading: false,
          error: {
            status: true,
            type: "passwordsMatch",
            message: "Passwords don't match"
          }
        }, () => {
          window.scrollTo({top: 0});
          this.hideModal()
          this.clearErrorMessage()
        })
        return false
      }

      //Encriptar la contraseña del usuario si todo es correcto
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(this.state.securityPassword, salt);
      
      // Guardar la contraseña en la base de datos
      await this.userRef.update({securityPassword: hashedPassword})

      this.setState({
        currentSecurityPassword: "",
        securityPassword: "",
        confirmSecurityPassword: "",
        securityPasswordSuccess: true
      }, () => {
        setTimeout(() => {
          this.setState({
            loading: false,
            securityPasswordSuccess: false
          })
        }, 3500)
      })
    } catch (error) {
      this.setState({
        error: {
          status: true,
          type: "submitSecurityPassword",
          message: error.message
        }
      }, () => {
        this.hideModal()
        this.clearErrorMessage()
      })
      console.log(error)
    }
  }

  // Chequear si la contraseña de seguridad es correcta (Sólo para usuarios de google provider)
  compareSecurityPasswords = async () => {
    const check = await bcryptjs.compare(this.state.currentSecurityPassword, this.props.user.securityPassword)
    if(check) {
      return true
    } else {
      return false
    }
  }

  // Confirmar formulario de cambio de contraseña para usuarios autenticados mediante email/password
  isFormValid = (data) => {
    if(data.userPassword === "" && data.newUserPassword === "" && data.confirmNewUserPassword) {
      this.setState({
        error: {
          status: true,
          type: "emptyFields",
          message: "You must complete all fields"
        }
      }, () => this.clearErrorMessage())
      return false

    } else if(data.userPassword === "") {
      this.setState({
        error: {
          status: true,
          type: "userPassword",
          message: "You must provide your current password"
        }
      }, () => this.clearErrorMessage())
      return false

    } else if(data.newUserPassword === "") {
      this.setState({
        error: {
          status: true,
          type: "newUserPassword",
          message: "You must provide your new password"
        }
      }, () => this.clearErrorMessage())
      return false
    } else if(data.confirmNewUserPassword === "") {
      this.setState({
        error: {
          status: true,
          type: "confirmNewUserPassword",
          message: "You must confirm your new password"
        }
      }, () => this.clearErrorMessage())
      return false
    }
    else if(data.newUserPassword !== data.confirmNewUserPassword) {
      this.setState({
        error: {
          status: true,
          type: "passwordsMatch",
          message: "Passwords don't match"
        }
      }, () => this.clearErrorMessage())
      window.scrollTo({top: 0})
      return false
    }
    return true
  }

  clearErrorMessage = () => {
    setTimeout(() => {
      this.setState({
        error: {
          ...this.state.error,
          type: null,
          status: false
        }
      })
    }, 4000)
  }

  render() {
    return (
      <div className="generic-wrapper">
        <DeleteAccount
          action={this.deletUserAccount}
          show={this.state.showDeleteAccountModal}
          hide={this.hideDeleteAccountModal}
        />
        <DisplayErrors error={this.state.error} />
        <UserInfo user={this.props.user} />
        <section className="profile-form" style={{marginBottom: "2rem"}}>
          <form onSubmit={this.onSubmitHandler} className="profile-form__update-form">
            <h2>Update your profile</h2>
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
                Choose new avatar...
                {/* {`${(this.state.imgFile && "File: " + this.state.imgFile.split('\\')[2]) || "Choose new avatar"}`} */}
              </label>
            </div>
            <input
              style={{display: "none"}}
              type="file"
              id="upload-image"
              ref={this.imageInputRef}
              name="imgFile"
              onChange={this.onImageChangeHandler}
              value={this.state.imgFile}
              accept="image/png, image/jpeg"
            />
            {this.state.imgFilePreview &&
              <div className="profile-form__avatar-preview">
                <img
                  className="profile-form__avatar-preview-img"
                  src={this.state.imgFilePreview} alt="avatar preview"
                />
                <p>Avatar preview</p>
              </div>
            }
            <input
              type="submit"
              className="update"
              id="update"
              disabled={this.state.uploading || this.state.updatingName || (!this.state.displayName && !this.state.imgFile)}
              value={
                this.state.uploading ? "Updating avatar..." :
                this.state.updatingName ? "Updating name..." :
                "Update profile"
              }
            />
          </form>

          {/* Modificar contraseña para usuarios logueados con email/password */}
          {auth.currentUser && auth.currentUser.providerData[0].providerId !== "google.com" &&
            <div className="security-password-wrapper">
              <div
                className={`${this.state.changeUserPasswordSuccess ?
                "security-password-wrapper--on-success" :
                "security-password-wrapper--on-success security-password-wrapper--on-success-hidden"}`}
              >
                <i className="far fa-check-circle"></i>
                <h1>Password <br/> successfully updated</h1>
              </div>
              <h2 style={{marginBottom: "1rem"}}>Change your password</h2>
              <form onSubmit={this.userPasswordHandler}>
                <input
                  className={`${this.state.error.type === "userPassword" ? "input-validation-error" : this.state.error.type === "emptyFields" ? "input-validation-error" : ""}`}
                  type="password"
                  name="userPassword"
                  placeholder= {`${this.state.error.type === "userPassword" ? this.state.error.message : "Current password"}`}
                  onChange={this.onChangeHandler}
                  value={this.state.userPassword}
                />
                <input
                className={`${this.state.error.type === "emptyFields" || this.state.error.type === "newUserPassword" ||this.state.error.type === "passwordsMatch" ? "input-validation-error" : ""}`}
                  type="password"
                  name="newUserPassword"
                  placeholder={`${this.state.error.type === "newUserPassword" ? this.state.error.message : "New password"}`}
                  onChange={this.onChangeHandler}
                  value={this.state.newUserPassword}
                />
                <input
                  className={`${this.state.error.type === "emptyFields" || this.state.error.type === "confirmNewUserPassword" ||this.state.error.type === "passwordsMatch" ? "input-validation-error" : ""}`}
                  type="password"
                  name="confirmNewUserPassword"
                  placeholder={`${this.state.error.type === "confirmNewUserPassword" ? this.state.error.message : "Confirm new password"}`}
                  onChange={this.onChangeHandler}
                  value={this.state.confirmNewUserPassword}
                />
                <button disabled={this.state.loading}>
                  {`${this.state.loading ? "Updating password..." : "Update password"}`}
                </button>
              </form>
            </div>
          }

          {/* Crear o actualizar contraseña de seguridad para usuarios logueados con Google */}
          {auth.currentUser && auth.currentUser.providerData[0].providerId === "google.com" &&
            <div className="security-password-wrapper">
              <div
                className={`${this.state.securityPasswordSuccess ?
                "security-password-wrapper--on-success" :
                "security-password-wrapper--on-success security-password-wrapper--on-success-hidden"}`}
              >
                <i className="far fa-check-circle"></i>
                <h1>Security password <br/> successfully updated</h1>
              </div>
              <h2>Create or update your security password</h2>
              <p>
                Your security password is required to perform sensitive operations, such as account deletion and change your user password
              </p>
              <form onSubmit={this.securityPasswordHandler}>
                {this.props.user && this.props.user.securityPassword &&
                  <input
                    className={`${this.state.error.type === "currentPassword" ? "input-validation-error" : ""}`}
                    type="password"
                    name="currentSecurityPassword"
                    placeholder= {`${this.state.error.type === "currentPassword" ? "Wrong password" : "Current security password"}`}
                    onChange={this.onChangeHandler}
                    value={this.state.currentSecurityPassword}
                  />
                }
                <input
                className={`${this.state.error.type === "emptyFields" || this.state.error.type === "securityPassword" || this.state.error.type === "passwordsMatch" ? "input-validation-error" : ""}`}
                  type="password"
                  name="securityPassword"
                  placeholder="Security password"
                  onChange={this.onChangeHandler}
                  value={this.state.securityPassword}
                />
                <input
                  className={`${this.state.error.type === "emptyFields" || this.state.error.type === "confirmSecurityPassword" || this.state.error.type === "passwordsMatch" ? "input-validation-error" : ""}`}
                  type="password"
                  name="confirmSecurityPassword"
                  placeholder="Confirm security password"
                  onChange={this.onChangeHandler}
                  value={this.state.confirmSecurityPassword}
                />
                <button>Create security password</button>
              </form>
            </div>
          }
        </section>
        <div className="delete-account-button">
          <div className="delete-account-button__text">
            <h2>Delete your account</h2>
            {this.props.user && !this.props.user.securityPassword && this.props.user && auth.currentUser.providerData[0].providerId === "google.com" &&
              <h3>In order to delete your account you must create your security password</h3>          
            }
          </div>
          <button
            disabled={!this.props.user || (this.props.user && auth.currentUser.providerData[0].providerId === "google.com" && !this.props.user.securityPassword)}
            onClick={() => this.setState({showDeleteAccountModal: true})}
          >
            Delete your account
          </button>
        </div>
        <UserPosts user={this.props.user} />
      </div>
    );
  }
}

export default WithUser(withRouter(UserProfile));

