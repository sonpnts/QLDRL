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

class SinhVienSerializer(serializers.ModelSerializer):
    class Meta:
        model = SinhVien
        fields = '__all__'


class HockyNamhocSerializer(serializers.ModelSerializer):
    class Meta:
        model = HocKy_NamHoc
        fields = '__all__'


class DieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dieu
        fields = '__all__'


class HoatDongNgoaiKhoaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoatDongNgoaiKhoa
        fields = '__all__'


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


class TaiKhoanSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['avatar'] = instance.image.url
        return req

    def create(self, validated_data):
        data = validated_data.copy()
        taikhoan = TaiKhoan(**data)
        taikhoan.set_password(data['password'])
        taikhoan.save()

        return taikhoan

    class Meta:
        model = TaiKhoan
        fields = ['id', 'email', 'username', 'password', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }



class AuthenticatedBaiVietTagSerializer(BaivietTagSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, bai_viet):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return bai_viet.like_set.filter(tai_khoan=request.user, active=True).exists()

    class Meta:
        model = BaivietTagSerializer.Meta.model
        fields = BaivietTagSerializer.Meta.fields + ['liked']