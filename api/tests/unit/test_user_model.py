from models.user import UserModel


def test_register_and_save_user(app):
    with app.app_context():
        user = UserModel.registerUser('alice')
        user.save_to_db()

        assert user.id is not None
        assert user.username == 'alice'


def test_find_by_username_found_and_not_found(app):
    with app.app_context():
        user = UserModel.registerUser('bob')
        user.save_to_db()

        assert UserModel.find_by_username('bob').id == user.id
        assert UserModel.find_by_username('nobody') is None


def test_find_by_id_found_and_not_found(app):
    with app.app_context():
        user = UserModel.registerUser('carol')
        user.save_to_db()

        assert UserModel.find_by_id(user.id).username == 'carol'
        assert UserModel.find_by_id(999999) is None
