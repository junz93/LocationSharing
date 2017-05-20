from django.conf.urls import url

from . import views

app_name = 'loc_sha'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^msg/$', views.msg, name='msg'),
    url(r'^stop/$', views.stop, name='stop'),
]

