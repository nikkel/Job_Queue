import React, { useState, useEffect } from 'react';
import Api from '../api';

const Account = (props) => {
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
};

export default Account;
