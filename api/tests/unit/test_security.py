from models.user import UserModel
from util.security import authenticate, identify


def test_authenticate_creates_new_user(app):
    with app.app_context():
        user = authenticate('NewPerson', 'ignored')

        assert user is not None
        assert user.username == 'newperson'


def test_authenticate_returns_existing_user_case_insensitively(app):
    with app.app_context():
        created = authenticate('Dave', 'ignored')
        found = authenticate('dave', 'ignored')

        assert created.id == found.id


def test_identify_returns_user_for_payload(app):
    with app.app_context():
        user = authenticate('erin', 'ignored')

        result = identify({'identity': user.id})

        assert isinstance(result, UserModel)
        assert result.id == user.id
