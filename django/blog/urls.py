from django.urls import path
from blog import views

urlpatterns = [
    path('signup', views.signup, name='signup'),
    path('signin', views.signin, name='signin'),
    path('signout', views.signout, name='signout'),
    path('article', views.article, name='article'),
    path('article/<int:article_id>', views.article_detail, name='article_detail'),
    path('article/<int:article_id>/comment', views.comment, name='comment'),
    path('comment/<int:comment_id>',
         views.comment_detail, name='comment_detail'),
    path('token', views.token, name='token'),
]
