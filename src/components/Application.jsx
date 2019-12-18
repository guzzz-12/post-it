import React, { Component } from 'react';
import Posts from './Posts';
import {firestore, auth, createUserProfileDoc} from "../firebase";
import {collectIdsAndDocs} from "../utils";
import Authentication from './Authentication';

class Application extends Component {
  state = {
    posts: [],
    user: null
  };

  unsubscribeFromFirestore = null;
  unsubscribeFromAuth = null;
  unsubscribeFromUsers = null;

  async componentDidMount() {
    this.unsubscribeFromFirestore = firestore.collection("posts").onSnapshot((snap) => {
      const posts = snap.docs.map(collectIdsAndDocs);
      this.setState({
        posts: posts
      })
    })

    this.unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
      const userDoc = await createUserProfileDoc(user)
      this.setState({user: userDoc})
    })

    this.unsubscribeFromUsers = firestore.collection("users").onSnapshot((snap) => {
      if(this.state.user && auth.currentUser) {
        const user = snap.docs.find(el => {
          return el.id === auth.currentUser.uid
        })
        
        if(user && this.state.user.displayName !== user.data().displayName) {
          this.updateUserPosts(user.id, user.data().displayName)
        }

        this.setState({
          user: {
            uid: user.id,
            ...user.data()
          }
        })
      }
    })
  }

  updateUserPosts = async (uid, name) => {
    let promises = []
    let posts = []
    let userPosts = []

    const postsRef = firestore.collection("posts")

    const postSnapshot = await postsRef.get()

    postSnapshot.forEach(post => posts.push({id: post.id, ...post.data()}))

    userPosts = posts.filter(post => post.user.uid === uid)

    userPosts.forEach((post) => {
      const updatedPost = {...post}
      updatedPost.displayName = name;
      updatedPost.user.displayName = name;
      promises.push(postsRef.doc(post.id).update(updatedPost))
    })

    await Promise.all(promises)
  }

  componentWillUnmount() {
    this.unsubscribeFromFirestore();
  }

  render() {
    const { posts } = this.state;

    return (
      <main className="Application">
        <h1>Think Piece</h1>
        <Authentication user={this.state.user} />
        <Posts posts={posts}/>
      </main>
    );
  }
}

export default Application;
