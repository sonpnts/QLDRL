import csv
from io import BytesIO
from datetime import datetime
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from unidecode import unidecode
from django.http import HttpResponse
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from rest_framework import viewsets, generics, status, parsers, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from trainingpoint.models import *
from trainingpoint import serializers, paginators, perms
from django.contrib.auth.models import AnonymousUser
from rest_framework.views import APIView
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Frame
from reportlab.lib import colors




class KhoaViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = Khoa.objects.filter(active=True)
    serializer_class = serializers.KhoaSerializer

    def get_queryset(self):
        queryset = self.queryset
        #if self.action == 'list':
        q = self.request.query_params.get('ten_khoa')
        if q:
           queryset = queryset.filter(ten_khoa__icontains=q)

        return queryset

    @action(methods=['get'], url_path='lops', detail=True)
    def get_lops(self, request, pk):
        lops = self.get_object().lop_set.filter(active=True)
        q = request.query_params.get('ten_lop')
        if q:
            lops = lops.filter(ten_lop__icontains=q)

        return Response(serializers.LopSerializer(lops, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='sinhviens', detail=True)
    def get_sinhviens(self, request, pk):
        khoa = self.get_object()
        # Lấy tất cả các lớp thuộc về khoa
        lops = khoa.lop_set.filter(active=True).prefetch_related('sinhvien_set')
        # Lấy tất cả sinh viên từ các lớp
        sinhviens = [sinhvien  # sinh viên thêm vào mảng
                     for lop in lops
                     for sinhvien in lop.sinhvien_set.filter(active=True)
                     ]
        q = request.query_params.get('ho_ten')
        if q:
            sinhviens = sinhviens.filter(ho_ten__icontains=q)
        return Response(serializers.SinhVienSerializer(sinhviens, many=True).data,
                        status=status.HTTP_200_OK)







class BaiVietViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView, generics.RetrieveAPIView):
    queryset = BaiViet.objects.filter(active=True)
    serializer_class = serializers.BaiVietSerializer

    def get_permissions(self):
        if self.action in ['add_comment', 'like']:
            return [permissions.IsAuthenticated()]
        else:
            if self.action in ['create', 'update', 'partial_update', 'destroy']:
                if isinstance(self.request.user, AnonymousUser):
                    return [permissions.IsAuthenticated()]
                else:
                    if (self.request.user.is_authenticated and
                            self.request.user.role in [TaiKhoan.Roles.TroLySinhVien.value,
                                                       TaiKhoan.Roles.CongTacSinhVien.value]):
                        return [permissions.IsAuthenticated()]
                    else:
                        raise exceptions.PermissionDenied()

        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedBaiVietTagSerializer

        return self.serializer_class

    def get_queryset(self):
        queries = self.queryset
        q = self.request.query_params.get("q")
        if q:
            queries = queries.filter(title__icontains=q)

        return queries

    @action(methods=['get'], url_path="comments", detail=True)
    def get_comments(self, request, pk):
        comments = Comment.objects.filter(bai_viet=pk).order_by('-created_date')
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path="comment", detail=True)
    def add_comment(self, request, pk):
        c = Comment.objects.create(tai_khoan=request.user, bai_viet=self.get_object(), content=request.data.get('content'))

        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        li, created = Like.objects.get_or_create(bai_viet=self.get_object(), tai_khoan=request.user)

        if not created:
            li.active = not li.active
            li.save()

        return Response(
            serializers.AuthenticatedBaiVietTagSerializer(self.get_object(), context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True, url_path='liked')
    def check_like_status(self, request, pk=None):
        bai_viet = self.get_object()
        user = request.user
        liked = Like.objects.filter(bai_viet=bai_viet, tai_khoan=user, active=1).exists()
        if not liked:
            return Response({'liked': False}, status=status.HTTP_200_OK)
        return Response({'liked': True }, status=status.HTTP_200_OK)


    @action(methods=['get'], url_path='tac_gia', detail=True)
    def get_tacgia(self, request, pk):
        baiviet = self.get_object()
        tacgia = TaiKhoan.objects.get(id=baiviet.tro_ly.id)
        return Response(serializers.TaiKhoanSerializer(tacgia).data, status=status.HTTP_200_OK)



class DieuViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Dieu.objects.filter(active=True)
    serializer_class = serializers.DieuSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        (self.request.user.role in [TaiKhoan.Roles.ADMIN,
                                                    TaiKhoan.Roles.TroLySinhVien])):
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        #if self.action == 'list':
        q = self.request.query_params.get('ten_dieu')
        if q:
            queryset = queryset.filter(ten_dieu__icontains=q)
        ma_dieu = self.request.query_params.get('ma_dieu')
        if ma_dieu:
            queryset = queryset.filter(ma_dieu=ma_dieu)

        return queryset

    @action(methods=['get'], url_path='hoatdongs', detail=True)
    def get_hoatdongs(self, request, pk):
        dieu = Dieu.objects.prefetch_related('hoatdongngoaikhoa_set').get(id=pk)
        hoatdongngoaikhoas = dieu.hoatdongngoaikhoa_set.all()
        q = self.request.query_params.get('ten_HD_NgoaiKhoa')
        if q:
            hoatdongngoaikhoas = hoatdongngoaikhoas.filter(ten_HD_NgoaiKhoa__icontains=q)
        return Response(serializers.HoatDongNgoaiKhoaSerializer(hoatdongngoaikhoas, many=True).data,
                        status=status.HTTP_200_OK)


class CommentViewset(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer

    # def get_permissions(self):
    #     if self.action == 'get_tac_gia':
    #         return [permissions.IsAuthenticated()]
    #     else:
    #         raise exceptions.PermissionDenied()
    #         # return [perms.CommentOwner()]

    @action(methods=['get'], url_path='tac_gia', detail=True)
    def get_tac_gia(self, request, pk):
        comment = self.queryset.get(pk=pk)
        tacgia = comment.tai_khoan
        return Response(serializers.TaiKhoanSerializer(tacgia).data, status=status.HTTP_200_OK)


class DiemRenLuyenViewset(viewsets.ViewSet, generics.ListCreateAPIView, generics.DestroyAPIView,
                          generics.UpdateAPIView):
    queryset = DiemRenLuyen.objects.all()
    serializer_class = serializers.DiemRenLuyenSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien,
                                                   TaiKhoan.Roles.TroLySinhVien,
                                                   TaiKhoan.Roles.ADMIN]):
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()

        return [permissions.AllowAny()]

    # @action(methods=['post'], url_path='tinh-diem-ren-luyen', detail=True)
    # def tinhdiemrenluyen(self, request, *args, **kwargs):
    #     sinh_vien_id = request.data.get('sinh_vien_id')
    #     try:
    #         sinh_vien = SinhVien.objects.get(id=sinh_vien_id)
    #         diem_ren_luyen = DiemRenLuyen.objects.tinh_diem_ren_luyen(sinh_vien)
    #         return Response({
    #             'sinh_vien': sinh_vien.ho_ten,
    #             'diem_tong': diem_ren_luyen.diem_tong,
    #             'xep_loai': diem_ren_luyen.get_xep_loai_display()
    #         })
    #     except SinhVien.DoesNotExist:
    #         return Response({'error': 'Sinh viên không tồn tại'}, status=404)
    #     except Exception as e:
    #         return Response({'error': str(e)}, status=500)

    def get_queryset(self):
        queryset = self.queryset
        diem = self.request.query_params.get("diem")
        if diem:
            queryset = queryset.filter(diem_tong__icontains=diem)

        sv_id = self.request.query_params.get("sv_id")
        if sv_id:
            queryset = queryset.filter(sinh_vien__icontains=sv_id)

        sv_name = self.request.query_params.get("sv_name")
        if sv_name:
            sv_ids = SinhVien.objects.filter(ho_ten__icontains=sv_name).values_list('id', flat=True)
            queryset = queryset.filter(sinh_vien__in=sv_ids)

        hk = self.request.query_params.get("hk")
        if hk:
            hk_ids = HocKy_NamHoc.objects.filter(hoc_ky=hk).values_list('id', flat=True)
            queryset = queryset.filter(hk_nh__in=hk_ids)

        nh = self.request.query_params.get("nh")
        if nh:
            nh_ids = HocKy_NamHoc.objects.filter(nam_hoc__icontains=nh).values_list('id', flat=True)
            queryset = queryset.filter(hk_nh__in=nh_ids)

        return queryset




class HocKyNamHocViewset(viewsets.ModelViewSet):
    queryset = HocKy_NamHoc.objects.all()
    serializer_class = serializers.HockyNamhocSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value,
                                                   TaiKhoan.Roles.ADMIN.value]):
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()
        return [permissions.AllowAny()]

class HoatDongNgoaiKhoaViewSet(viewsets.ViewSet,
                               generics.CreateAPIView,
                               generics.ListCreateAPIView,
                               generics.UpdateAPIView,
                               generics.DestroyAPIView,
                               generics.RetrieveAPIView):
    queryset = HoatDongNgoaiKhoa.objects.filter(active=True)
    serializer_class = serializers.HoatDongNgoaiKhoaSerializer
    # lookup_field = 'pk'

    def get_queryset(self):
        queryset = self.queryset
        #if self.action == 'list':
        q = self.request.query_params.get('ten_HD_NgoaiKhoa')
        hk=self.request.query_params.get('hoc_ky')
        if q:
           queryset = queryset.filter(ten_HD_NgoaiKhoa__icontains=q)

        if hk:
            queryset = queryset.filter(hk_nh__hoc_ky=hk)

        return

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        hd = HoatDongNgoaiKhoa.objects.get(id=pk)
        if hd:
            return Response(serializers.HoatDongNgoaiKhoaSerializer(hd).data, status=status.HTTP_200_OK)
        return Response({'error': 'Không tìm thấy hoạt động ngoại khóa'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path='diemdanh', detail=False)
    def get_hdnk_diemdanh(self, request):
        # Chỉ điểm danh các hoạt động được tổ chức bởi khoa mình, không được điểm danh các hoạt được tổ chức bởi khoa khác
        try:
            hk = self.request.query_params.get('hoc_ky')
            troly=TaiKhoan.objects.get(username=request.user.username)
            khoa = TroLySinhVien_Khoa.objects.get(trolySV=troly).khoa
            troly_list = TroLySinhVien_Khoa.objects.filter(khoa=khoa).values_list('trolySV', flat=True)
            hoatdong= HoatDongNgoaiKhoa.objects.filter(hk_nh__hoc_ky=hk, tro_ly__in=troly_list,
                                                       ngay_to_chuc__lte=timezone.now())

            if not hoatdong.exists():
                return Response({"message": "No activities found for the specified assistant and semester"},
                                status=status.HTTP_404_NOT_FOUND)

            return Response(serializers.HoatDongNgoaiKhoaSerializer(hoatdong, many=True).data,
                            status=status.HTTP_200_OK)

        except TaiKhoan.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        except TroLySinhVien_Khoa.DoesNotExist:
            return Response({"error": "Assistant not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], url_path='quanly', detail=False)
    def get_hdnk_quanly(self, request):
        # Chỉ điểm danh các hoạt động được tổ chức bởi khoa mình, không được điểm danh các hoạt được tổ chức bởi khoa khác
        try:
            hk = self.request.query_params.get('hoc_ky')
            troly = TaiKhoan.objects.get(username=request.user.username);
            khoa = TroLySinhVien_Khoa.objects.get(trolySV=troly).khoa;
            troly_list = TroLySinhVien_Khoa.objects.filter(khoa=khoa).values_list('trolySV', flat=True)
            hoatdong = HoatDongNgoaiKhoa.objects.filter(hk_nh__hoc_ky=hk, tro_ly__in=troly_list, active=True)

            # hoatdong_chua_co_baiviet = hoatdong.exclude(id__in=BaiViet.objects.values('hd_ngoaikhoa__id'))

            if not hoatdong.exists():
                return Response({"message": "No activities found for the specified assistant and semester"},
                                status=status.HTTP_404_NOT_FOUND)

            return Response(serializers.HoatDongNgoaiKhoaSerializer(hoatdong, many=True).data,
                            status=status.HTTP_200_OK)

        except TaiKhoan.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        except TroLySinhVien_Khoa.DoesNotExist:
            return Response({"error": "Assistant not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], detail=False, url_path='chua-co-bai-viet')
    def get_activities_without_post(self, request):
        try:
            hoc_ky = self.request.query_params.get('hoc_ky')
            troly=TaiKhoan.objects.get(username=request.user.username)
            khoa = TroLySinhVien_Khoa.objects.get(trolySV=troly).khoa
            troly_list = TroLySinhVien_Khoa.objects.filter(khoa=khoa).values_list('trolySV', flat=True)
            hoatdong = HoatDongNgoaiKhoa.objects.filter(hk_nh__hoc_ky=hoc_ky, tro_ly__in=troly_list, active=True, ngay_to_chuc__gt=timezone.now())
            # Lọc những hoạt động chưa có bài viết tương ứng trong model BaiViet
            hoatdong_chua_co_baiviet = hoatdong.exclude(id__in=BaiViet.objects.values('hd_ngoaikhoa__id'))

            return Response(serializers.HoatDongNgoaiKhoaSerializer(hoatdong_chua_co_baiviet, many=True).data, status=status.HTTP_200_OK)
        except TaiKhoan.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        except TroLySinhVien_Khoa.DoesNotExist:
            return Response({"error": "Assistant not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=False, url_path='delete-hoat-dong')
    def delete_hoat_dong(self, request, *args, **kwargs):
        hoatdong_id = request.query_params.get('hd')
        if not hoatdong_id:
            return Response({'error': 'hoatdong_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hoatdong = HoatDongNgoaiKhoa.objects.get(id=hoatdong_id)
        except HoatDongNgoaiKhoa.DoesNotExist:
            return Response({'error': 'Hoat dong not found'}, status=status.HTTP_404_NOT_FOUND)

        hoatdong.active = False
        hoatdong.save()

        baiviets = BaiViet.objects.filter(hd_ngoaikhoa=hoatdong.id)
        if baiviets.exists():
            baiviets.update(active=False)

        return Response(serializers.HoatDongNgoaiKhoaSerializer(hoatdong).data, status=status.HTTP_200_OK)


    def get_permissions(self):
            if self.action in ['get_thamgias']:
                return [permissions.IsAuthenticated()]
            if self.action in ['create', 'update', 'partial_update', 'destroy']:
                if isinstance(self.request.user, AnonymousUser):
                    return [permissions.IsAuthenticated()]
                else:
                    if (self.request.user.is_authenticated and
                            (self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value,
                                                        TaiKhoan.Roles.TroLySinhVien.value])):
                        return [permissions.IsAuthenticated()]
                    else:
                        raise exceptions.PermissionDenied()
            return [permissions.AllowAny()]

    @action(methods=['get'], url_path='thamgias', detail=True)
    def get_thamgias(self, request, pk):
        hoatdong = HoatDongNgoaiKhoa.objects.get(id=pk)
        thamgias = ThamGia.objects.filter(hd_ngoaikhoa=hoatdong)
        return Response(serializers.ThamGiaSerializer(thamgias, many=True).data,
                        status=status.HTTP_200_OK)


    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['tro_ly'] = TaiKhoan.objects.get(username=request.user.username).id
        hd = HoatDongNgoaiKhoa.objects.create(**data)
        return Response(serializers.HoatDongNgoaiKhoaSerializer(hd).data, status=status.HTTP_201_CREATED)

class LopViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = Lop.objects.filter(active=True)
    serializer_class = serializers.LopSerializer
    pagination_class = paginators.LopPaginator

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list':
            q = self.request.query_params.get('ten_lop')
            if q:
                queryset = queryset.filter(ten_lop__icontains=q)

        return queryset

    @action(methods=['get'], url_path='sinhviens', detail=True)
    def get_sinhviens(self, request, pk):
        sinhviens = self.get_object().sinhvien_set.filter(active=True)
        q = request.query_params.get('ho_ten')
        if q:
            sinhviens = sinhviens.filter(ho_ten__icontains=q)

        return Response(serializers.SinhVienSerializer(sinhviens, many=True).data,
                        status=status.HTTP_200_OK)

class MinhChungViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = MinhChung.objects.filter(active=True)
    serializer_class = serializers.MinhChungSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list':
            mssv = self.request.query_params.get('mssv')
            hoatdong = self.request.query_params.get('hoat_dong')
            if mssv:
                sinhvien = SinhVien.objects.get(mssv=mssv)
                thamgias = ThamGia.objects.filter(sinh_vien=sinhvien)
                queryset = queryset.filter(tham_gia__in=thamgias)
            if hoatdong:
                hoatdongs = HoatDongNgoaiKhoa.objects.filter(ten_HD_NgoaiKhoa__icontains=hoatdong)
                thamgias = ThamGia.objects.filter(hd_ngoaikhoa__in=hoatdongs)
                queryset = queryset.filter(tham_gia__in=thamgias)

            return queryset

class SinhVienViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.ListAPIView):
    serializer_class = serializers.SinhVienSerializer
    # pagination_class = paginators.SinhVienPaginator
    queryset = SinhVien.objects.all()
    def get_permissions(self):
        if self.action == "sinhvien_is_valid":
            return [permissions.AllowAny()]
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if isinstance(self.request.user, AnonymousUser):                                #AnonymousUser: Người dùng chưa đăng nhập
            return [permissions.IsAuthenticated()]                                      #Yêu cầu truy cập
        else:
            if self.request.user.role == TaiKhoan.Roles.SinhVien:
                if self.request.user.email == SinhVien.objects.filter(email=self.request.user.email).first().email:
                    return [permissions.IsAuthenticated()]                                #Cấp quyền truy cập
                else:
                    raise exceptions.PermissionDenied()                                 #Từ chối quyền truy cập
            elif (self.request.user.role == TaiKhoan.Roles.TroLySinhVien or
                  self.request.user.role == TaiKhoan.Roles.CongTacSinhVien):
                return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        #if self.action == 'list':
        q = self.request.query_params.get('ho_ten')
        if q:
           queryset = queryset.filter(ho_ten__icontains=q)
        mssv = self.request.query_params.get('mssv')
        if mssv:
            queryset = queryset.filter(mssv=mssv)

        return queryset

    @action(methods=['get', 'patch'], url_path='current-sinhvien', detail=False)
    def get_current_sv(self, request):
        sv = SinhVien.objects.get(email=request.user.email)
        if request.method == "PATCH":
            for k, v in request.data.items():
                if hasattr(sv, k):
                    setattr(sv, k, v)
            sv.save()
        return Response(serializers.SinhVienSerializer(sv).data)

class TaiKhoanViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = TaiKhoan.objects.filter(is_active=True).all()
    serializer_class = serializers.TaiKhoanSerializer
    # parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['taikhoan_is_valid']:
            return [permissions.AllowAny()]
        if self.action in ['get_current_user','PATCH']:
            return [permissions.IsAuthenticated()]
        elif self.action == "create":
            if isinstance(self.request.user, AnonymousUser):
                if self.request.data and (self.request.data.get('role') == str(TaiKhoan.Roles.SinhVien)):
                    return [permissions.AllowAny()]
                else:
                    return [permissions.IsAuthenticated()]
            elif self.request.data and self.request.data.get('role') == str(TaiKhoan.Roles.TroLySinhVien):
                if self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value, TaiKhoan.Roles.ADMIN.value]:
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()
            elif self.request.data and self.request.data.get('role') in [str(TaiKhoan.Roles.CongTacSinhVien),
                                                                         str(TaiKhoan.Roles.ADMIN)]:
                if self.request.user.role == TaiKhoan.Roles.ADMIN.value:
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()
        # elif self.action == "get_tac_gia":
        #     if self.request.data.get('role') == str(TaiKhoan.Roles.TroLySinhVien, TaiKhoan.Roles.CongTacSinhVien):
        #         return [permissions.IsAuthenticated()]


    @action(methods=['get', 'patch'], url_path='current-taikhoan', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__("PATCH"):
            for k, v in request.data.items():
                setattr(user, k, v)  # user.k = v (user.name = v)
            user.save()

        return Response(serializers.TaiKhoanSerializer(user).data)

    @action(methods=['get'], url_path='is_valid', detail=False)
    def taikhoan_is_valid(self, request):
        email = self.request.query_params.get('email')
        username = self.request.query_params.get('username')

        if email:
            taikhoan = TaiKhoan.objects.filter(email=email)
            if taikhoan.exists():
                return Response(data={'is_valid': "True", 'message': 'Email đã tồn tại'}, status=status.HTTP_200_OK)

        if username:
            taikhoan = TaiKhoan.objects.filter(username=username)
            if taikhoan.exists():
                return Response(data={'is_valid': "True", 'message': 'Username đã tồn tại'},
                                status=status.HTTP_200_OK)

        return Response(data={'is_valid': "False"}, status=status.HTTP_200_OK)

# class TagViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
#     queryset = Tag.objects.all()
#     serializer_class = serializers.TagSerializier
#
#     def get_permissions(self):
#         if self.action in ['create', 'update', 'partial_update', 'destroy']:
#             if isinstance(self.request.user, AnonymousUser):
#                 return [permissions.IsAuthenticated()]
#             else:
#                 if (self.request.user.is_authenticated and
#                         self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value,
#                                                    TaiKhoan.Roles.TroLySinhVien.value,
#                                                    TaiKhoan.Roles.ADMIN.value]):
#                     return [permissions.IsAuthenticated()]
#                 else:
#                     raise exceptions.PermissionDenied()
#
#         return [permissions.AllowAny()]
#
#     def get_queryset(self):
#         queryset = self.queryset
#         q = self.request.query_params.get("q")
#         if q:
#             queryset = queryset.filter(name__icontains=q)
#
#         return queryset
#
#     @action(methods=['get'], url_path='baiviets', detail=True)
#     def get_baiviet(self, request, pk):
#         baiviet = self.get_object().baiviets.all()
#         return Response(serializers.BaiVietSerializer(baiviet, many=True).data,
#                         status=status.HTTP_200_OK)

class TroLySinhVienKhoaViewset(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.UpdateAPIView):
    queryset = TroLySinhVien_Khoa.objects.all()
    serializer_class = serializers.TroLySinhVien_KhoaSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value,
                                                   TaiKhoan.Roles.ADMIN.value]):
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()
        elif self.action == 'get':
            if (self.request.user.is_authenticated and
                    self.request.user.role in [TaiKhoan.Roles.TroLySinhVienKhoa.value]):
                return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(tai_khoan__ho_ten__icontains=q)

        return queryset

    @action(methods=['get'], url_path='khoa', detail=True)
    def get_troly(self, request, pk):
        troly = TroLySinhVien_Khoa.objects.get(pk=pk)

        return Response(serializers.SinhVienSerializer(troly, many=True).data,
                        status=status.HTTP_200_OK)


class ThamGiaViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = ThamGia.objects.all()
    serializer_class = serializers.ThamGiaSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list':
            namhoc = self.request.query_params.get('nam_hoc')
            if namhoc:
                hocky_namhoc = HocKy_NamHoc.objects.filter(nam_hoc=namhoc)
                hoatdong_ids = HoatDongNgoaiKhoa.objects.filter(hk_nh__in=hocky_namhoc).values_list('id', flat=True)
                queryset = queryset.filter(hoat_dong_ngoai_khoa_id__in=hoatdong_ids)
            hocky = self.request.query_params.get('hoc_ky')
            if hocky:
                hocky_namhoc = HocKy_NamHoc.objects.filter(hoc_ky=hocky)
                hoatdong_ids = HoatDongNgoaiKhoa.objects.filter(hk_nh__in=hocky_namhoc).values_list('id', flat=True)
                queryset = queryset.filter(hoat_dong_ngoai_khoa_id__in=hoatdong_ids)
            mssv = self.request.query_params.get('mssv')
            if mssv:
                sinhvien = SinhVien.objects.get(mssv=mssv)
                queryset = queryset.filter(sinh_vien=sinhvien)

            return queryset

    @action(methods=['get'], url_path='minhchungs', detail=True)
    def get_thamgias(self, request, pk):
        thamgia = ThamGia.objects.get(id=pk)
        minhchung = MinhChung.objects.filter(tham_gia=thamgia)
        return Response(serializers.MinhChungSerializer(minhchung, many=True).data,
                        status=status.HTTP_200_OK)


    @action(methods=['post'], url_path='dang-ky-hoat-dong', detail=True)
    def dangkyhoatdong(self, request, pk=None):
        data = request.data.copy()
        hd_ngoaikhoa = HoatDongNgoaiKhoa.objects.get(id=pk)
        sinh_vien = SinhVien.objects.get(email=request.user.email)
        tham_gia = ThamGia.objects.create(
            sinh_vien=sinh_vien,
            hd_ngoaikhoa=hd_ngoaikhoa,
            trang_thai=ThamGia.TrangThai.DangKy
        )

        serializer = self.serializer_class(tham_gia)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True, url_path='kiem-tra-dang-ky')
    def check_registration_status(self, request, pk=None):

        # Lấy thông tin sinh viên từ request.user
        sinh_vien = SinhVien.objects.get(email=request.user.email)

        # Kiểm tra xem sinh viên đã đăng ký hoạt động này chưa
        registered = ThamGia.objects.filter(hd_ngoaikhoa=pk, sinh_vien=sinh_vien).exists()

        # Trả về phản hồi tùy thuộc vào trạng thái đăng ký
        if not registered:
            return Response({'registered': False}, status=status.HTTP_200_OK)
        return Response({'registered': True}, status=status.HTTP_200_OK)


class ExportBaoCaoViewLop(APIView):
    def get(self, request, id_lop, id_hoc_ky, id_format):
        try:
            # format = 'pdf'  # Cố định format thành 'pdf'
            lop = Lop.objects.get(pk=id_lop)
            khoa=Khoa.objects.get(pk=lop.khoa_id)
            hoc_ky_nam_hoc = HocKy_NamHoc.objects.get(pk=id_hoc_ky)
            sinh_viens = lop.sinhvien_set.all()
            diem_ren_luyen = DiemRenLuyen.objects.filter(sinh_vien__in=sinh_viens, hk_nh=hoc_ky_nam_hoc)
            serializer = serializers.BaoCaoSerializer(diem_ren_luyen, many=True)

            if id_format == 1:
                return self.export_csv(serializer.data, lop,khoa,hoc_ky_nam_hoc)
            elif id_format == 2:
                return self.export_pdf(serializer.data, lop,khoa,hoc_ky_nam_hoc)
            else:
                return Response({'error': 'Định dạng không hỗ trợ'}, status=status.HTTP_400_BAD_REQUEST)
        except Lop.DoesNotExist:
            return Response({'error': 'Lớp không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except HocKy_NamHoc.DoesNotExist:
            return Response({'error': 'Học kỳ năm học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def export_csv(self, data, lop, khoa, hk):
        response = HttpResponse(content_type='text/csv')
        file_name = f"bao_cao_diem_ren_luyen_lop_{lop}_khoa_{khoa}.csv"
        file_name_ascii = unidecode(file_name).lower()
        response['Content-Disposition'] = f'attachment; filename="{file_name_ascii}"'

        writer = csv.writer(response)

        # Get current date and time
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Write header
        writer.writerow(['', '', '', '', '', f"Ngày in: {now}"])
        writer.writerow(['', '', '', '', '', f"Mẫu: Báo cáo điểm rèn luyện"])
        writer.writerow([])

        # Write title
        writer.writerow([f"Báo cáo điểm rèn luyện lớp {lop} - Khoa {khoa} - Học kì {hk}", '', '', '', '', ''])
        writer.writerow([])

        # Write table headers
        writer.writerow(['Sinh Viên', 'Mã số sinh viên', 'Lớp', 'Khoa', 'Điểm Tổng', 'Xếp Loại'])

        # Write table data
        for item in data:
            writer.writerow(
                [item['sinh_vien'], item['mssv'], item['lop'], item['khoa'], item['diem_tong'], item['xep_loai']])

        return response

    def export_pdf(self, data, lop, khoa,hk):
        pdfmetrics.registerFont(TTFont('TimesNewRoman', 'times.ttf'))
        pdfmetrics.registerFont(TTFont('TimesNewRoman-Bold', 'timesbd.ttf'))


        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'title',
            parent=styles['Title'],
            fontName='TimesNewRoman-Bold',
            fontSize=16,
            alignment=1  # Center alignment
        )
        header_style = ParagraphStyle(
            'header',
            parent=styles['Normal'],
            fontName='TimesNewRoman',
            fontSize=10,
            alignment=2,  # Right alignment
            italic=True
        )
        table_style = TableStyle([
            ('FONT', (0, 0), (-1, -1), 'TimesNewRoman'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'TimesNewRoman-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ])
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Add header
        # Add header
        header = Paragraph(f"Ngày in: {now}<br/>Mẫu: Báo cáo điểm rèn luyện", header_style)
        elements.append(header)
        elements.append(Spacer(1, 12))

        # Add title
        title = Paragraph(f"Báo cáo điểm rèn luyện lớp {lop} - Khoa {khoa}<br/>Học kì {hk}", title_style)
        elements.append(title)
        elements.append(Spacer(1, 12))

        # Create table data
        data_table = [['Sinh Viên', 'Mã số sinh viên','Lớp', 'Khoa', 'Điểm Tổng', 'Xếp Loại']]
        for item in data:
            data_table.append([
                item['sinh_vien'],
                item['mssv'],
                item['lop'],
                item['khoa'],
                str(item['diem_tong']),
                item['xep_loai']
            ])

        col_widths = [120, 100, 100, 80, 80]
        # Create table
        table = Table(data_table, colWidths=col_widths)
        table.setStyle(table_style)
        elements.append(table)


        # Create a frame to hold the elements
        doc.build(elements)
        file_name = f"bao_cao_diem_ren_luyen_lop_{lop}_khoa_{khoa}.pdf"
        file_name_ascii = unidecode(file_name).lower()

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{file_name_ascii}"'

        buffer.close()
        return response

class ExportBaoCaoViewKhoa(APIView):
    def get(self, request, id_khoa, id_hoc_ky, id_format):
        try:
            khoa = Khoa.objects.get(pk=id_khoa)
            hoc_ky_nam_hoc = HocKy_NamHoc.objects.get(pk=id_hoc_ky)
            lop_list = Lop.objects.filter(khoa_id=khoa.id)
            sinh_viens = SinhVien.objects.filter(lop__in=lop_list)
            diem_ren_luyen = DiemRenLuyen.objects.filter(sinh_vien__in=sinh_viens, hk_nh=hoc_ky_nam_hoc)
            serializer = serializers.BaoCaoSerializer(diem_ren_luyen, many=True)

            if id_format == 1:
                return self.export_csv(serializer.data, khoa, hoc_ky_nam_hoc)
            elif id_format == 2:
                return self.export_pdf(serializer.data, khoa, hoc_ky_nam_hoc)
            else:
                return Response({'error': 'Định dạng không hỗ trợ'}, status=status.HTTP_400_BAD_REQUEST)
        except Khoa.DoesNotExist:
            return Response({'error': 'Khoa không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except HocKy_NamHoc.DoesNotExist:
            return Response({'error': 'Học kỳ năm học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def export_csv(self, data, khoa, hk):
        response = HttpResponse(content_type='text/csv')
        file_name = f"bao_cao_diem_ren_luyen_khoa_{khoa}.csv"
        file_name_ascii = unidecode(file_name).lower()
        response['Content-Disposition'] = f'attachment; filename="{file_name_ascii}"'

        writer = csv.writer(response)

        # Get current date and time
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Write header
        writer.writerow(['', '', '', '', '', f"Ngày in: {now}"])
        writer.writerow(['', '', '', '', '', f"Mẫu: Báo cáo điểm rèn luyện"])
        writer.writerow([])

        # Write title
        writer.writerow([f"Báo cáo điểm rèn luyện khoa {khoa} - Học kì {hk}", '', '', '', '', ''])
        writer.writerow([])

        # Write table headers
        writer.writerow(['Sinh Viên', 'Mã số sinh viên', 'Lớp', 'Khoa', 'Điểm Tổng', 'Xếp Loại'])

        # Write table data
        for item in data:
            writer.writerow(
                [item['sinh_vien'], item['mssv'], item['lop'], item['khoa'], item['diem_tong'], item['xep_loai']])

        return response

    def export_pdf(self, data, khoa, hk):
        pdfmetrics.registerFont(TTFont('TimesNewRoman', 'times.ttf'))
        pdfmetrics.registerFont(TTFont('TimesNewRoman-Bold', 'timesbd.ttf'))

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'title',
            parent=styles['Title'],
            fontName='TimesNewRoman-Bold',
            fontSize=16,
            alignment=1  # Center alignment
        )
        header_style = ParagraphStyle(
            'header',
            parent=styles['Normal'],
            fontName='TimesNewRoman',
            fontSize=10,
            alignment=2,  # Right alignment
            italic=True
        )
        table_style = TableStyle([
            ('FONT', (0, 0), (-1, -1), 'TimesNewRoman'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'TimesNewRoman-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ])

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Add header
        header = Paragraph(f"Ngày in: {now}<br/>Mẫu: Báo cáo điểm rèn luyện", header_style)
        elements.append(header)
        elements.append(Spacer(1, 12))

        # Add title
        title = Paragraph(f"Báo cáo điểm rèn luyện khoa {khoa}<br/>Học kì {hk}", title_style)
        elements.append(title)
        elements.append(Spacer(1, 12))

        # Create table data
        data_table = [['Sinh Viên', 'Mã số sinh viên', 'Lớp', 'Khoa', 'Điểm Tổng', 'Xếp Loại']]
        for item in data:
            data_table.append([
                item['sinh_vien'],
                item['mssv'],
                item['lop'],
                item['khoa'],
                str(item['diem_tong']),
                item['xep_loai']
            ])

        col_widths = [120, 100, 100, 80, 80]
        # Create table
        table = Table(data_table, colWidths=col_widths)
        table.setStyle(table_style)
        elements.append(table)

        # Build PDF
        doc.build(elements)

        file_name = f"bao_cao_diem_ren_luyen_khoa_{khoa}.pdf"
        file_name_ascii = unidecode(file_name).lower()

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{file_name_ascii}"'

        buffer.close()
        return response

class BaoCaoViewLop(APIView):
    def get(self, request, id_lop, id_hoc_ky):
        try:
            lop = Lop.objects.get(pk=id_lop)
            hoc_ky_nam_hoc = HocKy_NamHoc.objects.get(pk=id_hoc_ky)
            sinh_viens = lop.sinhvien_set.all()  # Get all students in the class
            diem_ren_luyen = DiemRenLuyen.objects.filter(sinh_vien__in=sinh_viens, hk_nh=hoc_ky_nam_hoc)
            serializer = serializers.BaoCaoSerializer(diem_ren_luyen, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Lop.DoesNotExist:
            return Response({'error': 'Lớp không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except HocKy_NamHoc.DoesNotExist:
            return Response({'error': 'Học kỳ năm học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BaoCaoViewKhoa(APIView):
    def get(self, request, id_khoa, id_hoc_ky):
        try:
            khoa = Khoa.objects.get(pk=id_khoa)
            hoc_ky_nam_hoc = HocKy_NamHoc.objects.get(pk=id_hoc_ky)
            sinh_viens = SinhVien.objects.filter(lop__khoa=khoa)  # Get all students in the department
            diem_ren_luyen = DiemRenLuyen.objects.filter(sinh_vien__in=sinh_viens, hk_nh=hoc_ky_nam_hoc)
            serializer = serializers.BaoCaoSerializer(diem_ren_luyen, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Khoa.DoesNotExist:
            return Response({'error': 'Khoa không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except HocKy_NamHoc.DoesNotExist:
            return Response({'error': 'Học kỳ năm học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CalculateDiemRenLuyen(APIView):
    def post(self, request, sinhvien_id, hk_id):
        try:
            sinh_vien = SinhVien.objects.get(id=sinhvien_id)
            # Lấy tất cả các hoạt động mà sinh viên đã tham gia trong học kỳ đó
            hoat_dong_tham_gia = ThamGia.objects.filter(sinh_vien=sinh_vien, hd_ngoaikhoa__hk_nh_id=hk_id, trang_thai=ThamGia.TrangThai.DiemDanh)

            # Tính điểm rèn luyện
            diem_ren_luyen = 0
            dieu_points = {}

            for tham_gia in hoat_dong_tham_gia:
                hd_ngoaikhoa = tham_gia.hd_ngoaikhoa
                dieu_id = hd_ngoaikhoa.dieu.id

                if dieu_id not in dieu_points:
                    dieu_points[dieu_id] = 0

                dieu_points[dieu_id] += hd_ngoaikhoa.diem_ren_luyen

            for dieu_id, points in dieu_points.items():
                try:
                    dieu = Dieu.objects.get(id=dieu_id)
                    diem_ren_luyen += min(points, dieu.diem_toi_da)
                except ObjectDoesNotExist:
                    return Response({'error': f'Dieu với ID {dieu_id} không tồn tại'},
                                    status=status.HTTP_400_BAD_REQUEST)

            # Lưu điểm rèn luyện vào bảng DiemRenLuyen
            diem_ren_luyen_entry, created = DiemRenLuyen.objects.update_or_create(
                sinh_vien=sinh_vien,
                hk_nh_id=hk_id,
                defaults={'diem_tong': diem_ren_luyen}
            )

            serializer = serializers.DiemRenLuyenSerializer(diem_ren_luyen_entry)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except SinhVien.DoesNotExist:
            return Response({'error': 'Sinh viên không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UploadFileDiemDanh(APIView):
    def post(self, request, hd_ngoaikhoa_id, *args, **kwargs):
        serializer = serializers.UploadFileDiemDanhSerializer(data=request.data)
        if serializer.is_valid():
            csv_file = serializer.validated_data['file']
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            reader = csv.reader(decoded_file)

            errors = []
            for row in reader:
                try:
                    mssv = row[0]
                    sinh_vien=SinhVien.objects.get(mssv=mssv)
                    hoatdongnk = HoatDongNgoaiKhoa.objects.get(id=hd_ngoaikhoa_id)
                    tham_gia = ThamGia.objects.get(
                        sinh_vien_id=sinh_vien.id,
                        hd_ngoaikhoa_id=hd_ngoaikhoa_id
                    )
                    tham_gia.trang_thai = ThamGia.TrangThai.DiemDanh
                    # now = datetime.now()

                    # Chuyển đổi thành datetime aware
                    # if timezone.is_naive(now):
                    #     now = timezone.make_aware(now, timezone.get_default_timezone())
                    tham_gia.ngay_diem_danh = timezone.now()
                    tham_gia.save()

                    CalculateDiemRenLuyen().post(request, sinhvien_id=sinh_vien.id, hk_id=hoatdongnk.hk_nh_id)
                except ThamGia.DoesNotExist:
                    errors.append(f"Không tìm thấy tham gia với MSSV {mssv} và HK_NH {hoatdongnk.ten_HD_NgoaiKhoa} trong hoạt động ngoại khóa {hd_ngoaikhoa_id}")
                except Exception as e:
                    errors.append(f"Đã xảy ra lỗi với MSSV {mssv}: {str(e)}")

            if errors:
                print(errors.encode('utf-8'))
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Cập nhật trạng thái thành công!"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





