import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import { userContext } from './contexts/userContext';
import Api from './api';

import CircleLoader from 'react-spinners/CircleLoader';
import { css } from '@emotion/react';
import './App.css';

const App = (props) => {
  const [user, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    login('admin');
  }, []);

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
      {/* Circle Loader needs to be centred it take cssOverride with is a CSSProperties object */}
      <CircleLoader
        color={'#000000'}
        loading={isLoading}
        cssOverride={{ display: 'block', margin: '0 auto' }}
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
