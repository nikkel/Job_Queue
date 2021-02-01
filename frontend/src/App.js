import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import { userContext } from './contexts/userContext';
import Api from './api';

import CircleLoader from 'react-spinners/CircleLoader';
import { css } from '@emotion/core';
import './App.css';

const App = (props) => {
  const [user, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      login('admin');
    } else {
      setIsLoading(false);
    }
  });

  async function login(username) {
    let token = await Api.account.login(username);
    if (token) {
      setToken(token);
      setIsLoading(false);
      return true;
    }
    return null;
  }

  return (
    <div>
      <CircleLoader
        color={'#000000'}
        loading={isLoading}
        css={css`
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 10px;
        `}
        size={400}
      />
      {isLoading ? (
        <h1>Loading</h1>
      ) : (
        <userContext.Provider value={{ user, token }}>
          <Dashboard />
        </userContext.Provider>
      )}
    </div>
  );
};
export default App;
