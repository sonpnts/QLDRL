from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import routers
from trainingpoint import views
from trainingpoint import send_mail

r = routers.DefaultRouter()

r.register('khoas', views.KhoaViewSet, basename='Khoa')
r.register('lops', views.LopViewSet, basename='Lớp')
r.register('taikhoans', views.TaiKhoanViewSet, basename='Tài Khoản')
r.register('sinhviens', views.SinhVienViewSet, basename='Sinh Viên')
r.register('dieus', views.DieuViewSet, basename='Điều')
r.register('hoatdongs', views.HoatDongNgoaiKhoaViewSet, basename='Hoạt Động Ngoại Khóa')
r.register('baiviets', views.BaiVietViewSet, basename="Bài Viết")
r.register('tags', views.TagViewSet, basename="Tag")
r.register('comments', views.CommentViewset, basename="Comment")
r.register('diemrenluyens', views.DiemRenLuyenViewset, basename='Điểm Rèn Luyện')
r.register('thamgias', views.ThamGiaViewSet, basename='Tham Gia')
r.register('minhchungs', views.MinhChungViewSet, basename='Minh Chứng')
r.register('send_mail', send_mail.SendEmailViewSet, basename='send_mail')
urlpatterns = [
    path('bao-cao/<int:id_lop>/<int:id_hoc_ky>/', views.BaoCaoView.as_view(), name='bao-cao'),
    path('', include(r.urls))
]
