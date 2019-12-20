import React from 'react';
import { render } from 'react-dom';

import './index.scss';

import Application from './components/Application';
import PostsProvider from './providers/PostsProvider';
import UserProvider from './providers/UserProvider';
import {BrowserRouter} from "react-router-dom";

render(
  <BrowserRouter>
    <UserProvider>
      <PostsProvider>
        <Application />
      </PostsProvider>
    </UserProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
