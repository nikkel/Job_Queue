import React from 'react';

export const userContext = React.createContext();

export const useContext = () => {
  return React.useContext(userContext);
};
