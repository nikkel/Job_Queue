import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import App from './App';
import Api from './api';

vi.mock('./api', () => ({
  default: {
    account: { login: vi.fn() },
    task: { getAll: vi.fn(), create: vi.fn() },
  },
}));

describe('App', () => {
  test('shows a loading state before login resolves', () => {
    Api.account.login.mockReturnValue(new Promise(() => {}));

    render(<App />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  test('renders the Dashboard once login succeeds', async () => {
    Api.account.login.mockResolvedValue('fake-token');
    Api.task.getAll.mockResolvedValue({ tasks: [] });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Image to Text' })).toBeInTheDocument();
    });
    expect(Api.account.login).toHaveBeenCalledWith('admin');
  });

  test('stays in the loading state when login fails', async () => {
    Api.account.login.mockResolvedValue(null);

    render(<App />);

    await waitFor(() => expect(Api.account.login).toHaveBeenCalled());
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
