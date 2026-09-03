import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockAxiosInstance = {
  get: vi.fn(),
  delete: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

const { default: Backend, setToken } = await import('./backend');

describe('Backend API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken(null);
  });

  test('get() returns response data and sends bearer header', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: 'Get is working!' });
    setToken('abc123');

    const result = await Backend.get('/');

    expect(result).toEqual('Get is working!');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/', {
      headers: { Authorization: 'Bearer abc123' },
    });
  });

  test('post() sends the body and multipart header when file config is set', async () => {
    mockAxiosInstance.post.mockResolvedValue({ data: { access_token: 'tok' } });

    const result = await Backend.post('auth', { username: 'test' }, { file: true });

    expect(result).toEqual({ access_token: 'tok' });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      'auth',
      { username: 'test' },
      expect.objectContaining({
        headers: { Authorization: 'Bearer null' },
        'Content-Type': 'multipart/form-data',
      })
    );
  });

  test('delete(), put(), and patch() unwrap response data', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: 'Delete is working!' });
    mockAxiosInstance.put.mockResolvedValue({ data: 'Put is working!' });
    mockAxiosInstance.patch.mockResolvedValue({ data: 'Patch is working!' });

    await expect(Backend.delete('/')).resolves.toEqual('Delete is working!');
    await expect(Backend.put('/')).resolves.toEqual('Put is working!');
    await expect(Backend.patch('/')).resolves.toEqual('Patch is working!');
  });

  test('propagates a friendly error message on failure', async () => {
    mockAxiosInstance.get.mockRejectedValue({
      response: { data: { error: 'boom' } },
    });

    await expect(Backend.get('/')).rejects.toThrow('boom');
  });

  test('falls back to the raw error message when no response body is present', async () => {
    mockAxiosInstance.get.mockRejectedValue(new Error('network down'));

    await expect(Backend.get('/')).rejects.toThrow('network down');
  });

  test('falls back to the raw response when no data field is present', async () => {
    mockAxiosInstance.get.mockResolvedValue('raw string response');

    await expect(Backend.get('/')).resolves.toEqual('raw string response');
  });

  test.each([
    ['delete', 'Delete is working!'],
    ['put', 'Put is working!'],
    ['patch', 'Patch is working!'],
  ])('%s() propagates a friendly error message on failure', async (method) => {
    mockAxiosInstance[method].mockRejectedValue({
      response: { data: { error: 'boom' } },
    });

    await expect(Backend[method]('/')).rejects.toThrow('boom');
  });

  test.each(['delete', 'put', 'patch'])(
    '%s() falls back to the raw error message when no response body is present',
    async (method) => {
      mockAxiosInstance[method].mockRejectedValue(new Error('network down'));

      await expect(Backend[method]('/')).rejects.toThrow('network down');
    }
  );

  test('post() propagates a friendly error message on failure', async () => {
    mockAxiosInstance.post.mockRejectedValue({
      response: { data: { error: 'invalid file' } },
    });

    await expect(Backend.post('user/task', {})).rejects.toThrow('invalid file');
  });

  test('post() falls back to the raw error message when no response body is present', async () => {
    mockAxiosInstance.post.mockRejectedValue(new Error('network down'));

    await expect(Backend.post('user/task', {})).rejects.toThrow('network down');
  });

  test('put() and patch() send a plain (non-multipart) header by default', async () => {
    mockAxiosInstance.put.mockResolvedValue({ data: 'ok' });
    mockAxiosInstance.patch.mockResolvedValue({ data: 'ok' });

    await Backend.put('/', { a: 1 });
    await Backend.patch('/', { a: 1 });

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/', { a: 1 }, {
      headers: { Authorization: 'Bearer null' },
    });
    expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/', { a: 1 }, {
      headers: { Authorization: 'Bearer null' },
    });
  });
});
