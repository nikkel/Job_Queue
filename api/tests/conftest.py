import pytest


@pytest.fixture
def app(tmp_path, monkeypatch):
    db_path = tmp_path / 'test.db'
    monkeypatch.setenv('MYSQL_URI', f'sqlite:///{db_path}')
    monkeypatch.setenv('REDIS_URI', 'redis://localhost:6379/15')
    monkeypatch.setenv('FLASK_SECRET_KEY', 'test-secret-key-thats-at-least-32-bytes-long')

    from app import create_app

    flask_app = create_app()
    flask_app.config['TESTING'] = True
    yield flask_app

    from util.db import db

    with flask_app.app_context():
        db.session.remove()
        db.engine.dispose()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_header(client):
    def _auth(username='admin'):
        res = client.post(
            '/auth',
            json={'username': username, 'password': 'none'},
        )
        token = res.get_json()['access_token']
        return {'Authorization': f'Bearer {token}'}

    return _auth
