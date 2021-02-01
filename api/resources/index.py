from flask_restful import Resource
from flask import make_response


class Index(Resource):

    def get(self):
        return make_response('Get is working!', 200)

    def delete(self):
        return make_response('Delete is working!', 200)

    def post(self):
        return make_response('Post is working!', 200)

    def put(self):
        return make_response('Put is working!', 200)

    def patch(self):
        return make_response('Patch is working!', 200)
