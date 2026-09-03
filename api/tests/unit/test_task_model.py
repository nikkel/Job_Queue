from unittest.mock import MagicMock, patch

from models.task import TaskModel
from util.db import db


def _make_task(app, job_id='job-1', user_id=1):
    with app.app_context():
        task = TaskModel(job_id, user_id, status='queued')
        task.save_to_db()
        return task.id


class _FakeStatus:
    def __init__(self, value):
        self.value = value


def test_json_without_update_does_not_refresh_from_queue(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)
        with patch.object(task, 'update_from_queue') as mock_update, \
                patch('models.task.queue.fetch_job', return_value=None):
            data = task.json(update=False)
        mock_update.assert_not_called()
        assert data['id'] == task_id
        assert data['job_id'] == 'job-1'
        assert data['status'] == 'queued'


def test_update_from_queue_missing_job_returns_current_state(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)
        with patch('models.task.queue.fetch_job', return_value=None):
            data = task.update_from_queue()
        assert data['status'] == 'queued'


def test_update_from_queue_finished_job_sets_result(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)

        fake_job = MagicMock()
        fake_job.get_status.return_value = _FakeStatus('finished')
        fake_job.latest_result.return_value.return_value = 'ocr text'
        fake_job.created_at = None
        fake_job.started_at = None
        fake_job.ended_at = None
        fake_job.enqueued_at = None
        fake_job.origin = 'default'

        with patch('models.task.queue.fetch_job', return_value=fake_job):
            data = task.update_from_queue()

        assert data['status'] == 'finished'
        assert data['result'] == 'ocr text'


def test_update_from_queue_failed_job_sets_error_result(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)

        fake_job = MagicMock()
        fake_job.get_status.return_value = _FakeStatus('failed')
        fake_job.latest_result.return_value.exc_string = 'boom'
        fake_job.created_at = None
        fake_job.started_at = None
        fake_job.ended_at = None
        fake_job.enqueued_at = None
        fake_job.origin = 'default'

        with patch('models.task.queue.fetch_job', return_value=fake_job):
            data = task.update_from_queue()

        assert data['status'] == 'failed'
        assert data['result'] == 'boom'


def test_update_from_queue_swallows_errors(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)
        with patch('models.task.queue.fetch_job', side_effect=RuntimeError('redis down')):
            data = task.update_from_queue()
        assert data['id'] == task_id


def test_get_job_position_returns_none_on_error(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)
        with patch('models.task.queue.fetch_job', side_effect=RuntimeError('redis down')):
            assert task.get_job_position() is None


def test_get_job_position_returns_value(app):
    task_id = _make_task(app)
    with app.app_context():
        task = db.session.get(TaskModel, task_id)
        fake_job = MagicMock()
        fake_job.get_position.return_value = 3
        with patch('models.task.queue.fetch_job', return_value=fake_job):
            assert task.get_job_position() == 3
