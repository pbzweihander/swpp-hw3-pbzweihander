from django.http import HttpResponse, JsonResponse
from django.http import HttpResponseNotAllowed, HttpResponseNotFound, HttpResponseForbidden
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Article, Comment
import json


def format_article(article):
    article['author'] = article.pop('author_id')
    return article


def signup(request):
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        User.objects.create_user(username=username, password=password)
        return HttpResponse(status=201)
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
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponseNotAllowed(['POST'])


def signout(request):
    from django.contrib.auth import logout
    if request.method == 'GET':
        if request.user.is_authenticated:
            logout(request)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponseNotAllowed(['GET'])


def article(request):
    if request.method not in ['GET', 'POST']:
        return HttpResponseNotAllowed(['GET', 'POST'])
    else:
        if not request.user.is_authenticated:
            return HttpResponse(status=401)
        if request.method == 'GET':
            article_list = list(map(
                format_article,
                [article for article in Article.objects.all().values()]
            ))
            return JsonResponse(article_list, safe=False)
        elif request.method == 'POST':
            return HttpResponse(status=500)


def article_detail(request, article_id=-1):
    if request.method == 'POST':
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])
    else:
        if not request.user.is_authenticated:
            return HttpResponse(status=401)
        try:
            article = Article.objects.get(id=article_id)
        except Article.DoesNotExist:
            return HttpResponseNotFound()
        if request.method == 'GET':
            return HttpResponse(status=500)
        elif request.method == 'PUT':
            return HttpResponse(status=500)
        elif request.method == 'DELETE':
            return HttpResponse(status=500)


@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])
