from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError


def test_create_app_retries_db_create_all_until_it_succeeds(monkeypatch, tmp_path):
    db_path = tmp_path / 'retry.db'
    monkeypatch.setenv('MYSQL_URI', f'sqlite:///{db_path}')
    monkeypatch.setenv('FLASK_SECRET_KEY', 'test-secret-key-thats-at-least-32-bytes-long')

    import app as app_module

    call_count = {'n': 0}
    real_create_all = app_module.db.create_all

    def flaky_create_all():
        call_count['n'] += 1
        if call_count['n'] < 3:
            raise OperationalError('stmt', {}, Exception('not ready'))
        return real_create_all()

    with patch.object(app_module.db, 'create_all', side_effect=flaky_create_all), \
            patch.object(app_module.time, 'sleep') as mock_sleep:
        flask_app = app_module.create_app()

    assert flask_app is not None
    assert call_count['n'] == 3
    assert mock_sleep.call_count == 2


def test_create_app_raises_after_exhausting_retries(monkeypatch, tmp_path):
    db_path = tmp_path / 'retry-fail.db'
    monkeypatch.setenv('MYSQL_URI', f'sqlite:///{db_path}')
    monkeypatch.setenv('FLASK_SECRET_KEY', 'test-secret-key-thats-at-least-32-bytes-long')

    import app as app_module

    def always_fails():
        raise OperationalError('stmt', {}, Exception('never ready'))

    with patch.object(app_module.db, 'create_all', side_effect=always_fails), \
            patch.object(app_module.time, 'sleep'):
        with pytest.raises(OperationalError):
            app_module.create_app()
