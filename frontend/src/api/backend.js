import Axios from 'axios';

const backend = Axios.create({
  baseURL: process.env.BACKEND_URL || 'http://127.0.0.1:5000',
});

let token = localStorage.getItem('token');
export function setToken(t) {
  if (t) {
    localStorage.setItem('token', t);
  } else {
    localStorage.removeItem('token');
  }

  token = t;
}

function getHeaders(config = { file: false }) {
  const headers = {
    headers: { Authorization: `JWT ${token}` },
  };
  if (config['file']) headers['Content-Type'] = 'multipart/form-data';

  return headers;
}

export default {
  get: async (url, config = {}) => {
    try {
      const res = await backend.get(url, {
        ...getHeaders(),
      });
      return res.data ?? res;
    } catch (e) {
      throw new Error(e.response?.data?.error ?? e.message);
    }
  },

  delete: async (url, config = {}) => {
    try {
      const res = await backend.delete(url, {
        ...getHeaders(),
      });
      return res.data ?? res;
    } catch (e) {
      throw new Error(e.response?.data?.error ?? e.message);
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const res = await backend.post(url, data, {
        ...getHeaders(config),
      });
      return res.data ?? res;
    } catch (e) {
      throw new Error(e.response?.data?.error ?? e.message);
    }
  },

  put: async (url, data, config = {}) => {
    try {
      const res = await backend.put(url, data, {
        ...getHeaders(),
      });
      return res.data ?? res;
    } catch (e) {
      throw new Error(e.response?.data?.error ?? e.message);
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      const res = await backend.patch(url, data, {
        ...getHeaders(),
      });
      return res.data ?? res;
    } catch (e) {
      throw new Error(e.response?.data?.error ?? e.message);
    }
  },
};
