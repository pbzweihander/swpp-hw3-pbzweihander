from django.http import HttpResponse, JsonResponse
from django.http import HttpResponseNotAllowed, HttpResponseNotFound, HttpResponseForbidden
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Article, Comment
import json


def HttpResponseOk():
    return HttpResponse(status=200)


def HttpResponseCreated():
    return HttpResponse(status=201)


def HttpResponseNoContent():
    return HttpResponse(status=204)


def HttpResponseUnauthorized():
    return HttpResponse(status=401)


def format_article_dict(article: dict):
    article['author'] = article.pop('author_id')
    return article


def format_article(article: Article):
    return {
        'title': article.title,
        'author': article.author.id,
        'content': article.content,
    }


def format_comment_dict(comment: dict):
    comment['article'] = comment.pop('article_id')
    comment['author'] = comment.pop('author_id')
    return comment


def format_comment(comment: Comment):
    return {
        'article': comment.article.id,
        'author': comment.author.id,
        'content': comment.content,
    }


def signup(request):
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        User.objects.create_user(username=username, password=password)
        return HttpResponseCreated()
    else:
        return HttpResponseNotAllowed(['POST'])


def signin(request):
    from django.contrib.auth import authenticate, login
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseNoContent()
        else:
            return HttpResponseUnauthorized()
    else:
        return HttpResponseNotAllowed(['POST'])


def signout(request):
    from django.contrib.auth import logout
    if request.method == 'GET':
        if request.user.is_authenticated:
            logout(request)
            return HttpResponseNoContent()
        else:
            return HttpResponseUnauthorized()
    else:
        return HttpResponseNotAllowed(['GET'])


def article(request):
    if request.method not in ['GET', 'POST']:
        return HttpResponseNotAllowed(['GET', 'POST'])
    else:
        if not request.user.is_authenticated:
            return HttpResponseUnauthorized()
        if request.method == 'GET':
            article_list = list(map(
                format_article_dict,
                [article for article in Article.objects.all().values()]
            ))
            return JsonResponse(article_list, safe=False)
        elif request.method == 'POST':
            body = json.loads(request.body.decode())
            article = Article(
                title=body['title'], content=body['content'], author=request.user)
            article.save()
            return HttpResponseCreated()
        else:  # pragma: no cover
            # unreachable code
            raise Exception("unreachable code")


def article_detail(request, article_id=-1):
    if request.method == 'POST':
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])
    else:
        if not request.user.is_authenticated:
            return HttpResponseUnauthorized()
        try:
            article = Article.objects.get(id=article_id)
        except Article.DoesNotExist:
            return HttpResponseNotFound()
        if request.method == 'GET':
            return JsonResponse(format_article(article), safe=False)
        elif request.method == 'PUT':
            if request.user != article.author:
                return HttpResponseForbidden()
            body = json.loads(request.body.decode())
            article.title = body['title']
            article.content = body['content']
            article.save()
            return HttpResponseOk()
        elif request.method == 'DELETE':
            if request.user != article.author:
                return HttpResponseForbidden()
            article.delete()
            return HttpResponseOk()
        else:  # pragma: no cover
            # unreachable code
            raise Exception("unreachable code")


def comment(request, article_id=-1):
    if request.method not in ['GET', 'POST']:
        return HttpResponseNotAllowed(['GET', 'POST'])
    else:
        if not request.user.is_authenticated:
            return HttpResponseUnauthorized()
        try:
            article = Article.objects.get(id=article_id)
        except Article.DoesNotExist:
            return HttpResponseNotFound()
        if request.method == 'GET':
            article_list = list(map(
                format_comment_dict,
                article.comments.values()
            ))
            return JsonResponse(article_list, safe=False)
        elif request.method == 'POST':
            body = json.loads(request.body.decode())
            comment = Comment(
                article=article, content=body['content'], author=request.user)
            comment.save()
            return HttpResponseCreated()
        else:  # pragma: no cover
            # unreachable code
            raise Exception("unreachable code")


def comment_detail(request, comment_id=-1):
    if request.method == 'POST':
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])
    else:
        if not request.user.is_authenticated:
            return HttpResponseUnauthorized()
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return HttpResponseNotFound()
        if request.method == 'GET':
            return JsonResponse(format_comment(comment), safe=False)
        elif request.method == 'PUT':
            if request.user != comment.author:
                return HttpResponseForbidden()
            body = json.loads(request.body.decode())
            comment.content = body['content']
            comment.save()
            return HttpResponseOk()
        elif request.method == 'DELETE':
            if request.user != comment.author:
                return HttpResponseForbidden()
            comment.delete()
            return HttpResponseOk()
        else:  # pragma: no cover
            # unreachable code
            raise Exception("unreachable code")


@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])
