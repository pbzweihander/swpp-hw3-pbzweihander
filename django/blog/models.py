from django.db import models
from django.contrib.auth.models import User


class Article(models.Model):
    title = models.CharField(max_length=120)
    content = models.TextField(max_length=500)
    author = models.ForeignKey(User, on_delete=models.CASCADE)


class Comment(models.Model):
    article = models.ForeignKey(
        Article, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField(max_length=240)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
