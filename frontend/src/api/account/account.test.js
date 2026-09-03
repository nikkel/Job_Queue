import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockBackend = { post: vi.fn() };
const mockSetToken = vi.fn();

vi.mock('../backend', () => ({
  default: mockBackend,
  setToken: mockSetToken,
}));

const { login, clearToken } = await import('./account');

describe('account api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('login() posts credentials and stores the returned token', async () => {
    mockBackend.post.mockResolvedValue({ access_token: 'tok-123' });

    const token = await login('admin');

    expect(mockBackend.post).toHaveBeenCalledWith('auth', {
      username: 'admin',
      password: 'password',
    });
    expect(mockSetToken).toHaveBeenCalledWith('tok-123');
    expect(token).toEqual('tok-123');
  });

  test('login() rejects when no username is provided', async () => {
    await expect(login()).rejects.toThrow('please enter your username');
    expect(mockBackend.post).not.toHaveBeenCalled();
  });

  test('login() returns null when the backend call fails', async () => {
    mockBackend.post.mockRejectedValue(new Error('network error'));

    const token = await login('admin');

    expect(token).toBeNull();
  });

  test('clearToken() clears the stored token', async () => {
    await clearToken();

    expect(mockSetToken).toHaveBeenCalledWith(null);
  });
});
