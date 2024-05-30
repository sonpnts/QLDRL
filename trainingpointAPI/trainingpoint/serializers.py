from rest_framework import serializers
from trainingpoint.models import *
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from .models import TaiKhoan, SinhVien, Lop
from django.core.files.base import ContentFile
from cloudinary.uploader import upload

import requests


class KhoaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Khoa
        fields = '__all__'


class LopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lop
        fields = '__all__'




class TaiKhoanSerializer(serializers.ModelSerializer):

    class Meta:
        model = TaiKhoan
        fields = ['id', 'email', 'username', 'password', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['avatar'] = instance.avatar.url
        return req

    def create(self, validated_data):
        data=validated_data.copy();
        taiKhoan = TaiKhoan(**data)
        taiKhoan.set_password(taiKhoan.password)

        taiKhoan.save()


        return taiKhoan




class ItemSerializer(serializers.ModelSerializer):  # Minh chứng, tài khoản, bài viết
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url

        return rep





class HockyNamhocSerializer(serializers.ModelSerializer):
    class Meta:
        model = HocKy_NamHoc
        fields = '__all__'


class DieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dieu
        fields = ['ma_dieu','ten_dieu']


class HoatDongNgoaiKhoaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoatDongNgoaiKhoa
        fields = '__all__'


class BaoCaoSerializer(serializers.ModelSerializer):
    sinh_vien = serializers.CharField(source='sinh_vien.ho_ten')
    lop = serializers.CharField(source='sinh_vien.lop.ten_lop')
    khoa = serializers.CharField(source='sinh_vien.lop.khoa.ten_khoa')
    xep_loai = serializers.SerializerMethodField()

    class Meta:
        model = DiemRenLuyen
        fields = ['sinh_vien', 'lop', 'khoa', 'diem_tong', 'xep_loai']

    def get_xep_loai(self, obj):
        return obj.get_xep_loai_display()

class ThamGiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThamGia
        fields = '__all__'


class MinhChungSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['anh_minh_chung'] = instance.image.url
        return req

    class Meta:
        model = MinhChung
        fields = '__all__'


class TagSerializier(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class BaiVietSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        return req

    class Meta:
        model = BaiViet
        fields = ['id', 'title', 'image', 'created_date', 'updated_date', 'tro_ly']


class BaivietTagSerializer(BaiVietSerializer):
    tags = TagSerializier(many=True)

    class Meta:
        model = BaiVietSerializer.Meta.model
        fields = BaiVietSerializer.Meta.fields + ['content', 'tags']


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class DiemRenLuyenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiemRenLuyen
        fields = '__all__'



class SinhVienSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        data = validated_data.copy()
        email = data.get('email', '')
        mssv=email[:10]
        sinh_vien = SinhVien.objects.create(mssv=mssv, **validated_data)
        # Lưu đối tượng SinhVien


        return sinh_vien
    class Meta:
        model = SinhVien
        fields = ['id', 'email', 'ho_ten', 'ngay_sinh', 'lop', 'dia_chi', 'gioi_tinh']

class AuthenticatedBaiVietTagSerializer(BaivietTagSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, bai_viet):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return bai_viet.like_set.filter(tai_khoan=request.user, active=True).exists()

    class Meta:
        model = BaivietTagSerializer.Meta.model
        fields = BaivietTagSerializer.Meta.fields + ['liked']
