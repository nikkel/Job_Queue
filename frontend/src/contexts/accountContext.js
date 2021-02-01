import React, { useContext, useState, useEffect, useEffect } from 'react';

const accountContext = React.createContext(null);

export { accountContext };

export const useAccount = () => {
  return useContext(accountContext);
};

export const accountProvider = () => {
  const [account, setAccount] = useState(null);

  async function login(username) {
    await Api.account.login(username, 'none');

    setAccount({ user: username });
    return true;
  }

  async function logout() {
    await Api.account.logout();
    setAccount(null);
  }

  useEffect(() => {});

  return (
    <userContext.Provider
      value={{
        isAuthorised: !!account,
        account,
        login,
        logout,
      }}
    >
      {() => {
        if (!account) {
          return <Login />;
        }

        return children;
      }}
    </userContext.Provider>
  );
};
