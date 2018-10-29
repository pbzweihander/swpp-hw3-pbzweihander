from django.http import HttpResponse, HttpResponseNotAllowed
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
import json


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
    if request.method == 'GET':
        raise Exception("unimplemented")
    elif request.method == 'POST':
        raise Exception("unimplemented")
    else:
        return HttpResponseNotAllowed(['GET', 'POST'])


def article_detail(request, article_id=-1):
    if request.method == 'POST':
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])
    else:
        q = Article.objects.filter(id=article_id)
        if not q.exists():
            return HttpResponse(status=404)
        article = q[0]
        if request.method == 'GET':
            raise Exception("unimplemented")
        elif request.method == 'PUT':
            raise Exception("unimplemented")
        elif request.method == 'DELETE':
            raise Exception("unimplemented")


@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])
