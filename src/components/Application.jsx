import React, { Component } from 'react';
import Posts from './Posts';
import {firestore} from "../firebase";
import {collectIdsAndDocs} from "../utils";

class Application extends Component {
  state = {
    posts: []
  };

  unsubscribe = null;

  async componentDidMount() {
    this.unsubscribe = firestore.collection("posts").onSnapshot((snap) => {
      const posts = snap.docs.map(collectIdsAndDocs);
      this.setState({
        posts: posts
      })
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { posts } = this.state;

    return (
      <main className="Application">
        <h1>Think Piece</h1>
        <Posts posts={posts}/>
      </main>
    );
  }
}

export default Application;
