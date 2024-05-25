from rest_framework import serializers
from trainingpoint.models import *

class KhoaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Khoa
        fields = '__all__'

class LopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lop
        fields = '__all__'