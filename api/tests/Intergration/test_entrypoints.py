import unittest
import pytest
import tempfile
import os
import json
from app import create_app, db


@pytest.fixture
def client():
    """Define test variables and initialize app."""
    app = create_app()
    app.config['TESTING'] = True
    # client = app.test_client()
    with app.test_client() as client:
        # binds the app to the current context
        with app.app_context():
            # create all tables
            db.session.remove()
            db.drop_all()
            db.create_all()
        yield client


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


def test_endpoint_auth(client):
    # Given Payload
    payload = json.dumps({
        "username": "admin",
        "password": "none"
    })

    # Request
    response = client.post('auth', data=payload, headers={
        "Content-Type": "application/json"})

    # Asset
    assert str == type(response.json['access_token'])
    assert 200 == response.status_code


def test_endpoint_tasks(client):
    # Given Payload
    payload = json.dumps({
        "username": "admin",
        "password": "none"
    })

    # Authentication
    req = client.post('auth', data=payload, headers={
        "Content-Type": "application/json"})
    token = req.json['access_token']

    assert str == type(token)

    # Request
    response = client.get(
        'user/tasks',
        data=payload,
        headers={
            "Authorization": f'JWT {token}',
            "Content-Type": "application/json"
        }
    )

    assert list == type(response.json['tasks'])
    assert 200 == response.status_code


def test_endpoint_task_not_found(client):
    # Given Payload
    payload = json.dumps({
        "username": "admin",
        "password": "none"
    })

    # Authentication
    req = client.post('auth', data=payload, headers={
        "Content-Type": "application/json"})
    token = req.json['access_token']

    assert str == type(token)

    # Request
    response = client.get(
        'user/task/100',
        data=payload,
        headers={
            "Authorization": f'JWT {token}',
            "Content-Type": "application/json"
        }
    )

    assert 'Task not found' == response.json['message']
    assert 404 == response.status_code


# Make the tests conveniently executable
if __name__ == "__main__":
    unittest.main()
