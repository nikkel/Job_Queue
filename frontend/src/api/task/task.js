import Backend from '../backend';

export async function getAll(headers = { headers: {} }) {
  return await Backend.get('user/tasks', headers);
}

export async function create(formData) {
  try {
    return await Backend.post('user/task', formData, { file: true });
  } catch (error) {
    throw error;
  }
}
