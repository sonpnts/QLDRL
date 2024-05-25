from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import routers
from trainingpoint import views
from trainingpoint import send_mail

r = routers.DefaultRouter()

r.register('khoas', views.KhoaViewSet, basename='khoas')
r.register('lops', views.LopViewSet, basename='lops')


urlpatterns = [
    path('', include(r.urls))
]
