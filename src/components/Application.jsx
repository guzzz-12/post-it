import React, { Component } from 'react';
import {Switch, Route} from "react-router-dom";
import Posts from './Posts';
import PostPage from "./PostPage";
import User from "./User";
import Nav from "./Nav";
import Signin from "./Auth/Signin/Signin";
import Signup from "./Auth/Signup/Signup";
import UserProfile from './UserProfile';
import CreatePostPage from './CreatePost/CreatePostPage';
import Footer from './Footer/Footer';
import NotFound from './NotFound/NotFound';
import Notifications from "./Notifications/Notifications";
import FilteredPosts from "./FilteredPosts/FilteredPosts";

class Application extends Component {
  render() {
    return (
      <div className="main-wrapper">
        <Notifications />
        <Nav />
        <main className="Application">
          <Switch>
            <Route exact path="/" component={Posts} />
            <Route exact path="/create-post" component={CreatePostPage} />
            <Route exact path="/signin" component={Signin} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/profile" component={UserProfile} />
            <Route exact path="/post/:postId" component={PostPage} />
            <Route exact path="/post/category/:postCategory" component={FilteredPosts} />
            <Route exact path="/users/:userId" component={User} />
            <Route exact path="*" component={NotFound} />
          </Switch>
        </main>
        <Footer/>
      </div>
    );
  }
}

export default Application;
