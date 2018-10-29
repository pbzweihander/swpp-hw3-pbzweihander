from django.test import TestCase, Client
from .models import Article, Comment
from django.contrib.auth.models import User
import json


class CsrfTestCase(TestCase):
    def test_csrf(self):
        # By default, csrf checks are disabled in test client
        # To test csrf protection we enforce csrf checks here
        client = Client(enforce_csrf_checks=True)
        response = client.post('/api/signup', json.dumps({'username': 'chris', 'password': 'chris'}),
                               content_type='application/json')
        # Request without csrf token returns 403 response
        self.assertEqual(response.status_code, 403)

        response = client.get('/api/token')
        # Get csrf token from cookie
        csrftoken = response.cookies['csrftoken'].value

        response = client.post('/api/signup', json.dumps({'username': 'chris', 'password': 'chris'}),
                               content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken)
        self.assertEqual(response.status_code, 201)  # Pass csrf protection


class BlogTestCase(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.csrftoken = self.client.get(
            '/api/token').cookies['csrftoken'].value

    def get(self, url):
        return self.client.get(url, HTTP_X_CSRFTOKEN=self.csrftoken)

    def post(self, url, obj):
        return self.client.post(
            url, json.dumps(obj), content_type='application/json', HTTP_X_CSRFTOKEN=self.csrftoken)

    def put(self, url, obj):
        return self.client.put(
            url, json.dumps(obj), content_type='application/json', HTTP_X_CSRFTOKEN=self.csrftoken)

    def delete(self, url):
        return self.client.delete(url, HTTP_X_CSRFTOKEN=self.csrftoken)

    def test_basic_models(self):
        new_user = User.objects.create_user(
            username='swpp', password='iluvswpp')
        new_article = Article(title='I Love SWPP!',
                              content='Believe it or not', author=new_user)
        new_article.save()
        new_comment = Comment(article=new_article,
                              content='Comment!', author=new_user)
        new_comment.save()

    def test_sign_up_and_sign_in(self):
        resp = self.post('/api/signup',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 201)

        resp = self.post('/api/signin',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 201)

        resp = self.post('/api/signin',
                         {'username': 'rustacean', 'password': 'ihaterust'})
        self.assertEqual(resp.status_code, 401)
