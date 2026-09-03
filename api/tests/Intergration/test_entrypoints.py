import io
from unittest.mock import patch

from PIL import Image


def test_index_get(client):
    rv = client.get('/')
    assert b'Get is working!' == rv.data


def test_index_post(client):
    rv = client.post('/')
    assert b'Post is working!' == rv.data


def test_index_delete(client):
    rv = client.delete('/')
    assert b'Delete is working!' == rv.data


def test_index_put(client):
    rv = client.put('/')
    assert b'Put is working!' == rv.data


def test_index_patch(client):
    rv = client.patch('/')
    assert b'Patch is working!' == rv.data


def test_endpoint_auth_creates_new_user(client):
    response = client.post('/auth', json={'username': 'admin', 'password': 'none'})

    assert 200 == response.status_code
    assert isinstance(response.json['access_token'], str)


def test_endpoint_auth_returns_same_user_on_second_login(client):
    first = client.post('/auth', json={'username': 'repeatuser', 'password': 'none'})
    second = client.post('/auth', json={'username': 'repeatuser', 'password': 'none'})

    assert 200 == first.status_code == second.status_code
    assert first.json['access_token'] != second.json['access_token']


def test_endpoint_auth_is_case_insensitive_on_first_login(client):
    response = client.post('/auth', json={'username': 'MixedCase', 'password': 'none'})

    assert 200 == response.status_code
    assert isinstance(response.json['access_token'], str)


def test_endpoint_tasks_empty(client, auth_header):
    response = client.get('/user/tasks', headers=auth_header())

    assert 200 == response.status_code
    assert [] == response.json['tasks']


def test_endpoint_tasks_requires_auth(client):
    response = client.get('/user/tasks')

    assert 401 == response.status_code


def test_endpoint_task_not_found(client, auth_header):
    response = client.get('/user/task/100', headers=auth_header())

    assert 404 == response.status_code
    assert 'Task not found' == response.json['message']


def _png_bytes():
    image = Image.new('RGB', (10, 10), color='white')
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)
    return buf


class _FakeStatus:
    value = 'queued'


class _FakeJob:
    id = 'fake-job-id'
    created_at = None
    started_at = None
    ended_at = None
    enqueued_at = None
    origin = 'default'

    def get_status(self):
        return _FakeStatus()


def test_endpoint_task_create_and_fetch(client, auth_header):
    headers = auth_header()

    with patch('resources.task.queue.enqueue', return_value=_FakeJob()) as mock_enqueue:
        create_response = client.post(
            '/user/task',
            data={'file': (_png_bytes(), 'test.png')},
            headers=headers,
            content_type='multipart/form-data',
        )

    assert 201 == create_response.status_code
    assert mock_enqueue.called
    task_id = create_response.json['id']

    with patch('models.task.queue.fetch_job', return_value=None):
        get_response = client.get(f'/user/task/{task_id}', headers=headers)

    assert 200 == get_response.status_code
    assert task_id == get_response.json['id']


def test_endpoint_task_create_rejects_non_image(client, auth_header):
    headers = auth_header()

    bad_file = io.BytesIO(b'not an image')
    response = client.post(
        '/user/task',
        data={'file': (bad_file, 'not-an-image.txt')},
        headers=headers,
        content_type='multipart/form-data',
    )

    assert 404 == response.status_code


def test_endpoint_task_belongs_to_other_user_is_not_found(client, auth_header):
    owner_headers = auth_header('owner')
    other_headers = auth_header('other')

    with patch('resources.task.queue.enqueue', return_value=_FakeJob()):
        create_response = client.post(
            '/user/task',
            data={'file': (_png_bytes(), 'test.png')},
            headers=owner_headers,
            content_type='multipart/form-data',
        )
    task_id = create_response.json['id']

    response = client.get(f'/user/task/{task_id}', headers=other_headers)

    assert 404 == response.status_code
