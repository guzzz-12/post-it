import React, { Component } from 'react';
import Posts from './Posts';
import {Switch, Route} from "react-router-dom";
import PostPage from "./PostPage";
import User from "./User";
import Nav from "./Nav";
import SignInAndSignUp from "./SignInAndSignUp";
import UserProfile from './UserProfile';
import CreatePostPage from './CreatePost/CreatePostPage';
import Footer from './Footer/Footer';

class Application extends Component {
  render() {
    return (
      <div className="main-wrapper">
        <Nav />
        <main className="Application">
          <Switch>
            <Route exact path="/" component={Posts} />
            <Route exact path="/create-post" component={CreatePostPage} />
            <Route exact path="/signin-signup" component={SignInAndSignUp} />
            <Route exact path="/profile" component={UserProfile} />
            <Route exact path="/post/:postId" component={PostPage} />
            <Route exact path="/users/:userId" component={User} />
          </Switch>
        </main>
        <Footer/>
      </div>
    );
  }
}

export default Application;
