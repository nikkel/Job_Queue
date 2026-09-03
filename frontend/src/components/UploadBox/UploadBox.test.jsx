import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import UploadBox from './UploadBox';
import Api from '../../api';
import Swal from 'sweetalert2';

vi.mock('../../api', () => ({
  default: {
    task: { create: vi.fn() },
  },
}));
vi.mock('sweetalert2', () => {
  const mixinFire = vi.fn();
  return {
    default: {
      mixin: vi.fn(() => ({ fire: mixinFire })),
      __mixinFire: mixinFire,
    },
  };
});

describe('UploadBox', () => {
  beforeEach(() => {
    Api.task.create.mockReset();
    Swal.mixin.mockClear();
    Swal.__mixinFire.mockClear();
  });

  test('renders without failure', () => {
    const { container } = render(<UploadBox />);
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  test('uploads a selected file and shows a success toast', async () => {
    Api.task.create.mockResolvedValue({ id: 1, status: 'queued' });
    const user = userEvent.setup();
    const { container } = render(<UploadBox />);
    const input = container.querySelector('input[type="file"]');
    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(Api.task.create).toHaveBeenCalledTimes(1);
    const formData = Api.task.create.mock.calls[0][0];
    expect(formData.get('file')).toBe(file);
    expect(Swal.__mixinFire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'success' })
    );

    // Exercise the toast's didOpen hover-pause wiring.
    const toastConfig = Swal.mixin.mock.calls[0][0];
    const fakeToast = { addEventListener: vi.fn() };
    toastConfig.didOpen(fakeToast);
    expect(fakeToast.addEventListener).toHaveBeenCalledWith('mouseenter', Swal.stopTimer);
    expect(fakeToast.addEventListener).toHaveBeenCalledWith('mouseleave', Swal.resumeTimer);
  });

  test('shows an error toast when the upload fails', async () => {
    Api.task.create.mockRejectedValue(new Error('upload failed'));
    const user = userEvent.setup();
    const { container } = render(<UploadBox />);
    const input = container.querySelector('input[type="file"]');
    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(Swal.__mixinFire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'error' })
    );

    const toastConfig = Swal.mixin.mock.calls[0][0];
    const fakeToast = { addEventListener: vi.fn() };
    toastConfig.didOpen(fakeToast);
    expect(fakeToast.addEventListener).toHaveBeenCalledWith('mouseenter', Swal.stopTimer);
    expect(fakeToast.addEventListener).toHaveBeenCalledWith('mouseleave', Swal.resumeTimer);
  });
});
