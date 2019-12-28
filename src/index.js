import React from 'react';
import { render } from 'react-dom';

import './index.scss';

import Application from './components/Application';
import PostsProvider from './providers/PostsProvider';
import UserProvider from './providers/UserProvider';
import EditPostState from "./context/editPost/editPostState";
import LastPostState from "./context/lastPost/lastPostState";
import {BrowserRouter} from "react-router-dom";

render(
  <BrowserRouter>
    <LastPostState>
      <EditPostState>
        <UserProvider>
          <PostsProvider>
            <Application />
          </PostsProvider>
        </UserProvider>
      </EditPostState>
    </LastPostState>
  </BrowserRouter>,
  document.getElementById('root')
);
