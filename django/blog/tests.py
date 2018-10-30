from django.test import TestCase, Client
from .models import Article, Comment
from django.contrib.auth.models import User
import json


class BlogTestCase(TestCase):
    def setUp(self):
        self.reset_client()

    def reset_client(self):
        self.client = Client(enforce_csrf_checks=True)

    def get(self, url):
        csrftoken = self.client.get('/api/token').cookies['csrftoken'].value
        return self.client.get(url, HTTP_X_CSRFTOKEN=csrftoken)

    def post(self, url, obj):
        csrftoken = self.client.get('/api/token').cookies['csrftoken'].value
        return self.client.post(
            url, json.dumps(obj), content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken)

    def put(self, url, obj):
        csrftoken = self.client.get('/api/token').cookies['csrftoken'].value
        return self.client.put(
            url, json.dumps(obj), content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken)

    def delete(self, url):
        csrftoken = self.client.get('/api/token').cookies['csrftoken'].value
        return self.client.delete(url, HTTP_X_CSRFTOKEN=csrftoken)


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

    def test_invalid_method(self):
        client = Client(enforce_csrf_checks=True)

        csrftoken = client.get('/api/token').cookies['csrftoken'].value
        self.assertEqual(client.post(
            '/api/token', json.dumps({}), content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken).status_code, 405)
        csrftoken = client.get('/api/token').cookies['csrftoken'].value
        self.assertEqual(client.put(
            '/api/token', json.dumps({}), content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken).status_code, 405)
        csrftoken = client.get('/api/token').cookies['csrftoken'].value
        self.assertEqual(client.delete(
            '/api/token', content_type='application/json', HTTP_X_CSRFTOKEN=csrftoken).status_code, 405)


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

        self.assertEqual(self.post('/api/signout', {}).status_code, 405)
        self.assertEqual(self.put('/api/signout', {}).status_code, 405)
        self.assertEqual(self.delete('/api/signout').status_code, 405)


class ArticleTestCase(BlogTestCase):
    def setUp(self):
        super().setUp()
        self.user1 = User.objects.create_user(
            username='user1', password='user1secret')
        self.user2 = User.objects.create_user(
            username='user2', password='user2secret')

        self.article1 = Article(title='article1 title',
                                content='article1 content', author=self.user1)
        self.article1.save()
        self.article2 = Article(title='article2 title',
                                content="article2 content", author=self.user2)
        self.article2.save()

        self.comment1 = Comment(article=self.article1,
                                content='comment 1 content', author=self.user1)
        self.comment1.save()

        self.post('/api/signin', {'username': 'user1',
                                  'password': 'user1secret'})

    def test_get_article(self):
        resp = self.get('/api/article')
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(len(resp_json), 2)
        self.assertEqual(resp_json[0]['title'], self.article1.title)
        self.assertEqual(resp_json[1]['title'], self.article2.title)
        self.assertEqual(resp_json[0]['author'], self.user1.id)
        self.assertEqual(resp_json[1]['author'], self.user2.id)
        self.assertEqual(resp_json[0]['content'], self.article1.content)
        self.assertEqual(resp_json[1]['content'], self.article2.content)

    def test_post_article(self):
        new_article = {'title': 'new article title',
                       'content': 'new article content'}
        resp = self.post('/api/article', new_article)
        self.assertEqual(resp.status_code, 201)

        all_articles = Article.objects.all()
        article = all_articles[len(all_articles) - 1]
        self.assertEqual(article.title, new_article['title'])
        self.assertEqual(article.content, new_article['content'])
        self.assertEqual(article.author, self.user1)

    def test_get_article_detail(self):
        resp = self.get('/api/article/{}'.format(self.article1.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(resp_json['title'], self.article1.title)
        self.assertEqual(resp_json['author'], self.user1.id)
        self.assertEqual(resp_json['content'], self.article1.content)

        resp = self.get('/api/article/{}'.format(self.article2.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(resp_json['title'], self.article2.title)
        self.assertEqual(resp_json['author'], self.user2.id)
        self.assertEqual(resp_json['content'], self.article2.content)

    def test_put_article_detail(self):
        new_article = {'title': 'new article title',
                       'content': 'new article content'}
        resp = self.put(
            '/api/article/{}'.format(self.article1.id), new_article)
        self.assertEqual(resp.status_code, 200)

        article = Article.objects.get(id=self.article1.id)
        self.assertEqual(article.title, new_article['title'])
        self.assertEqual(article.content, new_article['content'])

        resp = self.put(
            '/api/article/{}'.format(self.article2.id), new_article)
        self.assertEqual(resp.status_code, 403)

    def test_delete_article_detail(self):
        id = self.article1.id
        cid = self.comment1.id
        resp = self.delete('/api/article/{}'.format(id))
        self.assertEqual(resp.status_code, 200)

        article = Article.objects.filter(id=id)
        self.assertTrue(not article.exists())
        comment = Comment.objects.filter(id=cid)
        self.assertTrue(not comment.exists())

        resp = self.delete('/api/article/{}'.format(self.article2.id))
        self.assertEqual(resp.status_code, 403)

    def test_invalid_method(self):
        self.assertEqual(self.put('/api/article', {}).status_code, 405)
        self.assertEqual(self.delete('/api/article').status_code, 405)

        self.assertEqual(self.post('/api/article/0', {}).status_code, 405)

    def test_unauthorized(self):
        self.get('/api/signout')

        self.assertEqual(self.get('/api/article').status_code, 401)
        self.assertEqual(self.post('/api/article', {}).status_code, 401)

        self.assertEqual(self.get('/api/article/0').status_code, 401)
        self.assertEqual(self.put('/api/article/0', {}).status_code, 401)
        self.assertEqual(self.delete('/api/article/0').status_code, 401)

    def test_not_found(self):
        self.assertEqual(self.get('/api/article/0').status_code, 404)
        self.assertEqual(self.put('/api/article/0', {}).status_code, 404)
        self.assertEqual(self.delete('/api/article/0').status_code, 404)


class CommentTestCase(BlogTestCase):
    def setUp(self):
        super().setUp()
        self.user1 = User.objects.create_user(
            username='user1', password='user1secret')
        self.user2 = User.objects.create_user(
            username='user2', password='user2secret')

        self.article1 = Article(title='article1 title',
                                content='article1 content', author=self.user1)
        self.article1.save()

        self.comment1 = Comment(article=self.article1,
                                content='comment 1 content', author=self.user1)
        self.comment1.save()
        self.comment2 = Comment(article=self.article1,
                                content='comment 2 content', author=self.user2)
        self.comment2.save()

        self.post('/api/signin', {'username': 'user1',
                                  'password': 'user1secret'})

    def test_get_comment(self):
        resp = self.get('/api/article/{}/comment'.format(self.article1.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(len(resp_json), 2)
        self.assertEqual(resp_json[0]['article'], self.article1.id)
        self.assertEqual(resp_json[1]['article'], self.article1.id)
        self.assertEqual(resp_json[0]['author'], self.user1.id)
        self.assertEqual(resp_json[1]['author'], self.user2.id)
        self.assertEqual(resp_json[0]['content'], self.comment1.content)
        self.assertEqual(resp_json[1]['content'], self.comment2.content)

    def test_post_comment(self):
        new_comment = {'content': 'new comment content'}
        resp = self.post(
            '/api/article/{}/comment'.format(self.article1.id), new_comment)
        self.assertEqual(resp.status_code, 201)

        all_comments = Comment.objects.all()
        comment = all_comments[len(all_comments) - 1]
        self.assertEqual(comment.article, self.article1.id)
        self.assertEqual(comment.content, new_comment['content'])
        self.assertEqual(comment.author, self.user1)

    def test_get_comment_detail(self):
        resp = self.get('/api/comment/{}'.format(self.comment1.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(resp_json['article'], self.article1.id)
        self.assertEqual(resp_json['author'], self.user1.id)
        self.assertEqual(resp_json['content'], self.comment1.content)

        resp = self.get('/api/comment/{}'.format(self.comment2.id))
        self.assertEqual(resp.status_code, 200)

        resp_json = resp.json()
        self.assertEqual(resp_json['article'], self.article1.id)
        self.assertEqual(resp_json['author'], self.user2.id)
        self.assertEqual(resp_json['content'], self.comment2.content)

    def test_put_comment_detail(self):
        new_comment = {'content': 'new comment content'}
        resp = self.put(
            '/api/comment/{}'.format(self.comment1.id), new_comment)
        self.assertEqual(resp.status_code, 200)

        comment = Comment.objects.get(id=self.comment1.id)
        self.assertEqual(comment.content, new_comment['content'])

        resp = self.put(
            '/api/comment/{}'.format(self.article2.id), new_comment)
        self.assertEqual(resp.status_code, 403)

    def test_delete_comment_detail(self):
        id = self.comment1.id
        resp = self.delete('/api/comment/{}'.format(id))
        self.assertEqual(resp.status_code, 200)

        comment = Comment.objects.filter(id=id)
        self.assertTrue(not comment.exists())

        resp = self.delete('/api/article/{}'.format(self.comment2.id))
        self.assertEqual(resp.status_code, 403)

    def test_invalid_method(self):
        self.assertEqual(
            self.put('/api/article/0/comment', {}).status_code, 405)
        self.assertEqual(self.delete(
            '/api/article/0/comment').status_code, 405)

        self.assertEqual(self.post('/api/comment/0', {}).status_code, 405)

    def test_unauthorized(self):
        self.get('/api/signout')

        self.assertEqual(self.get('/api/article/0/comment').status_code, 401)
        self.assertEqual(
            self.post('/api/article/0/comment', {}).status_code, 401)

        self.assertEqual(self.get('/api/comment/0').status_code, 401)
        self.assertEqual(self.put('/api/comment/0', {}).status_code, 401)
        self.assertEqual(self.delete('/api/comment/0').status_code, 401)

    def test_not_found(self):
        self.assertEqual(self.get('/api/comment/0').status_code, 404)
        self.assertEqual(self.put('/api/comment/0', {}).status_code, 404)
        self.assertEqual(self.delete('/api/comment/0').status_code, 404)
