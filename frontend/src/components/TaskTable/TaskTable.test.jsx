import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import TaskTable from './TaskTable';
import Api from '../../api';
import Swal from 'sweetalert2';

vi.mock('../../api', () => ({
  default: {
    task: { getAll: vi.fn() },
  },
}));
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

describe('TaskTable', () => {
  beforeEach(() => {
    Api.task.getAll.mockReset();
    Swal.fire.mockReset();
    // The component polls every 5s via setInterval; fire the callback
    // immediately so tests don't need to wait on real wall-clock time.
    vi.spyOn(global, 'setInterval').mockImplementation((fn) => {
      fn();
      return 0;
    });
    vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders without failure', () => {
    Api.task.getAll.mockResolvedValue({ tasks: [] });
    render(<TaskTable />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('the loading spinner is not nested inside tbody (only <tr> is valid there)', () => {
    Api.task.getAll.mockResolvedValue({ tasks: [] });
    const { container } = render(<TaskTable />);

    const tbody = container.querySelector('tbody');
    for (const child of tbody.children) {
      expect(child.tagName).toBe('TR');
    }
  });

  test('polls the task list and renders fetched rows', async () => {
    Api.task.getAll.mockResolvedValue({
      tasks: [
        {
          id: 1,
          job_id: 'job-abc',
          status: 'finished',
          created_at: '2026-01-01',
          ended_at: '2026-01-02',
          result: 'hello world',
        },
      ],
    });

    render(<TaskTable />);

    expect(await screen.findByText('job-abc')).toBeInTheDocument();
    expect(screen.getByText('finished')).toBeInTheDocument();
  });

  test('opens a details popup when a row is clicked', async () => {
    const user = userEvent.setup();
    Api.task.getAll.mockResolvedValue({
      tasks: [
        {
          id: 7,
          job_id: 'job-xyz',
          status: 'finished',
          created_at: '2026-01-01',
          ended_at: '2026-01-02',
          result: 'some text',
        },
      ],
    });

    render(<TaskTable />);
    await screen.findByText('job-xyz');

    const [cell] = screen.getAllByText('View').filter((el) => el.tagName === 'TD');
    await user.click(cell);

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Job ID: 7' })
    );
    // Regression check: only real SweetAlert2 options should be passed --
    // this call used to include a stray `isUploading` key (copy-paste
    // leftover from UploadBox's unrelated state) that SweetAlert2 warns
    // about as an unknown parameter.
    const callArgs = Swal.fire.mock.calls[0][0];
    expect(Object.keys(callArgs).sort()).toEqual(['html', 'text', 'title']);
  });

  test('silently handles a failed fetch', async () => {
    Api.task.getAll.mockRejectedValue(new Error('network down'));

    render(<TaskTable />);

    await vi.waitFor(() => expect(Api.task.getAll).toHaveBeenCalled());
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
