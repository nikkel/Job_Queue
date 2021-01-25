from models.user import UserModel


def authenticate(username, password):
    # IMPORTANT:    Passwords are not being used, users are able
    #               to login with just a username is this project.
    #               Users should not be created during the
    #               authentication usually.

    # TODO sanitize input more lowercase
    sanitized_username = str.lower(username)

    # Check if your exist and return user
    user = UserModel.find_by_username(sanitized_username)
    if user:
        return user

    # Create a new user if they don't exist
    user = UserModel.registerUser(sanitized_username)
    user.save_to_db()

    # Get the new user from the db and return user
    return UserModel.find_by_username(username)


def identify(payload):
    # Payload in the request passes user_id we find user by id
    user_id = payload['identity']
    return UserModel.find_by_id(user_id)
