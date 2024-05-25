from rest_framework import viewsets, generics, status, parsers, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from trainingpoint.models import *
from trainingpoint import serializers, paginators, perms
from django.contrib.auth.models import AnonymousUser


class KhoaViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = Khoa.objects.all()
    serializers_class = serializers.KhoaSerializer


class LopViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = Lop.objects.all()
    serializers_class = serializers.LopSerializer