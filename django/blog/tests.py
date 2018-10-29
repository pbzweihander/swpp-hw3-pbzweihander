from django.test import TestCase, Client
from .models import Article, Comment
from django.contrib.auth.models import User
import json


class BlogTestCase(TestCase):
    def setUp(self):
        self.reset_client()

    def reset_client(self):
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


class ModelTestCase(TestCase):
    def test_basic_models(self):
        new_user = User.objects.create_user(
            username='swpp', password='iluvswpp')
        new_article = Article(title='I Love SWPP!',
                              content='Believe it or not', author=new_user)
        new_article.save()
        new_comment = Comment(article=new_article,
                              content='Comment!', author=new_user)
        new_comment.save()


class UserTestCase(BlogTestCase):
    def test_sign_up_in_and_out(self):
        resp = self.post('/api/signup',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 201)

        resp = self.post('/api/signin',
                         {'username': 'rustacean', 'password': 'iluvrust'})
        self.assertEqual(resp.status_code, 204)

        resp = self.get('/api/signout')
        self.assertEqual(resp.status_code, 204)

        self.reset_client()

        resp = self.post('/api/signin',
                         {'username': 'rustacean', 'password': 'ihaterust'})
        self.assertEqual(resp.status_code, 401)

        resp = self.get('/api/signout')
        self.assertEqual(resp.status_code, 401)

    def test_invalid_method(self):
        self.assertEqual(self.get('/api/signup').status_code, 405)
        self.assertEqual(self.put('/api/signup', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signup').status_code, 405)

        self.assertEqual(self.get('/api/signin').status_code, 405)
        self.assertEqual(self.put('/api/signin', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signin').status_code, 405)


class ArticleTestCase(BlogTestCase):
    def setUp(self):
        super().setUp()
        user1 = User.objects.create_user(
            username='user1', password='user1secret')
        user2 = User.objects.create_user(
            username='user2', password='user2secret')

        article1 = Article(title='article1 title',
                           content='article1 content', author=user1)
        article1.save()
        article2 = Article(title='article2 title',
                           content="article2 content", author=user2)
        article2.save()

    def test_get_article(self):
        resp = self.get('/api/article')
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(len(resp_json), 2)
        self.assertEqual(resp_json[0].title, "article1 title")
        self.assertEqual(resp_json[1].title, "article2 title")
        self.assertEqual(resp_json[0].author_id, 0)
        self.assertEqual(resp_json[1].author_id, 1)
        self.assertEqual(resp_json[0].content, "article1 content")
        self.assertEqual(resp_json[1].content, "article2 content")

    def test_invalid_method(self):
        self.assertEqual(self.put('/api/article', {}).status_code, 405)
        self.assertEqual(self.delete('/api/article').status_code, 405)

        self.assertEqual(self.post('/api/article/0', {}).status_code, 405)
