import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockBackend = { get: vi.fn(), post: vi.fn() };

vi.mock('../backend', () => ({
  default: mockBackend,
}));

const { getAll, create } = await import('./task');

describe('task api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getAll() fetches the task list with the given headers', async () => {
    mockBackend.get.mockResolvedValue({ tasks: [] });
    const headers = { headers: { Authorization: 'Bearer tok' } };

    const result = await getAll(headers);

    expect(mockBackend.get).toHaveBeenCalledWith('user/tasks', headers);
    expect(result).toEqual({ tasks: [] });
  });

  test('create() uploads form data as a file', async () => {
    mockBackend.post.mockResolvedValue({ id: 1, status: 'queued' });
    const formData = new FormData();

    const result = await create(formData);

    expect(mockBackend.post).toHaveBeenCalledWith('user/task', formData, { file: true });
    expect(result).toEqual({ id: 1, status: 'queued' });
  });

  test('create() propagates errors from the backend', async () => {
    mockBackend.post.mockRejectedValue(new Error('upload failed'));

    await expect(create(new FormData())).rejects.toThrow('upload failed');
  });
});
