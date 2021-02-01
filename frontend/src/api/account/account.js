import Backend, { setToken } from '../backend';

export async function clearToken() {
  setToken(null);
}

export async function login(user) {
  if (!user) {
    throw new Error('please enter your username');
  }
  try {
    const res = await Backend.post('auth', {
      username: user,
      password: 'password',
    });
    setToken(res.access_token);
    return res.access_token;
  } catch (error) {}
  return null;
}
