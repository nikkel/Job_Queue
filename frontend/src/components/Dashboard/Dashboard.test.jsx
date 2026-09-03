import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Dashboard from './Dashboard';

vi.mock('../UploadBox/UploadBox', () => ({
  default: () => <div data-testid='upload-box' />,
}));
vi.mock('../TaskTable/TaskTable', () => ({
  default: () => <div data-testid='task-table' />,
}));

describe('Dashboard', () => {
  test('renders without failure', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('upload-box')).toBeInTheDocument();
    expect(screen.getByTestId('task-table')).toBeInTheDocument();
  });

  test('shows the expected title', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'Image to Text' })).toBeInTheDocument();
  });
});
