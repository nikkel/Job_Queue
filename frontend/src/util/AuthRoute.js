import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useContext } from '../contexts/userContext';

const AuthRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useContext();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to='/' />
      }
    />
  );
};

export default AuthRoute;
