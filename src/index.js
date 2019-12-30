import React from 'react';
import { render } from 'react-dom';

import './index.scss';

import Application from './components/Application';
import PostsProvider from './providers/PostsProvider';
import UserProvider from './providers/UserProvider';
import EditPostState from "./context/editPost/editPostState";
import LastPostState from "./context/lastPost/lastPostState";
import {BrowserRouter} from "react-router-dom";
import SearchPostsState from './context/searchPosts/searchPostsState';

render(
  <BrowserRouter>
    <SearchPostsState>
      <LastPostState>
        <EditPostState>
          <UserProvider>
            <PostsProvider>
              <Application />
            </PostsProvider>
          </UserProvider>
        </EditPostState>
      </LastPostState>
    </SearchPostsState>
  </BrowserRouter>,
  document.getElementById('root')
);
