from django.contrib.auth.models import AnonymousUser
from rest_framework import permissions
from trainingpoint.models import TaiKhoan


class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.tai_khoan


# class SinhVienOwner(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, sinhvien):
#         return super().has_permission(request, view) and request.user.email == sinhvien.email
#
#
# class TuongTacHoatDong(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, hoatdong):
#         return (super().has_permission(request, view) and
#                 ((request.user.role == TaiKhoan.Roles.TroLySinhVien) or
#                  (request.user.role == TaiKhoan.Roles.CongTacSinhVien)))
#
#
# class TaoTroLy(permissions.IsAuthenticated):
#     def has_permission(self, request, view):
#         return request.user and (request.user.is_superuser or request.user.role == TaiKhoan.Roles.CongTacSinhVien)