import React, { Component } from 'react';
import Posts from './Posts';
import {firestore, auth} from "../firebase";
import {collectIdsAndDocs} from "../utils";
import Authentication from './Authentication';

class Application extends Component {
  state = {
    posts: [],
    user: null
  };

  unsubscribeFromFirestore = null;
  unsubscribeFromAuth = null;

  async componentDidMount() {
    this.unsubscribeFromFirestore = firestore.collection("posts").onSnapshot((snap) => {
      const posts = snap.docs.map(collectIdsAndDocs);
      this.setState({
        posts: posts
      })
    })

    this.unsubscribeFromAuth = auth.onAuthStateChanged((user) => {
      this.setState({user: user})
    })
  }

  componentWillUnmount() {
    this.unsubscribeFromFirestore();
  }

  render() {
    console.log(this.state.user)
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
