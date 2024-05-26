from rest_framework import viewsets, generics, status, parsers, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from trainingpoint.models import *
from trainingpoint import serializers, paginators, perms
from django.contrib.auth.models import AnonymousUser

class SinhVienViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = SinhVien.objects.filter(active=True)
    serializer_class = serializers.SinhVienSerializer
    pagination_class = paginators.SinhVienPaginator

### KHI NÀO ĐĂNG NHẬP = GG VÀ PHÂN QUYỀN XONG THÌ MỚI MỞ RA DÙNG
    # def get_permissions(self):
    #     if self.action == "sinhvien_is_valid":
    #         return [permissions.AllowAny()]                                             #Cho phép quyền truy cập
    #     if isinstance(self.request.user, AnonymousUser):                                #AnonymousUser: Người dùng chưa đăng nhập
    #         return [permissions.IsAuthenticated()]                                      #Yêu cầu truy cập
    #     else:
    #         if self.request.user.role == TaiKhoan.Roles.SinhVien:
    #             if self.request.user.email == self.get_object().email:
    #                 return [permissions.IsAuthenticated()]                              #Cấp quyền truy cập
    #             else:
    #                 raise exceptions.PermissionDenied()                                 #Từ chối quyền truy cập
    #         elif (self.request.user.role == TaiKhoan.Roles.TroLySinhVien or
    #               self.request.user.role == TaiKhoan.Roles.CongTacSinhVien):
    #             return [permissions.IsAuthenticated()]

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

    @action(methods=['get'], url_path='is_valid', detail=False)
    def sinhvien_is_valid(self, request):
        email = self.request.query_params.get('email')
        if email:
            sinhvien = SinhVien.objects.filter(email=email)
            if sinhvien:
                return Response(data={'is_valid': True}, status=status.HTTP_200_OK)
        return Response(data={'is_valid': False}, status=status.HTTP_404_NOT_FOUND)


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
                     for lop in lops  # lặp qua các lớp
                     for sinhvien in lop.sinhvien_set.filter(active=True)
                     # Lặp qua các sinh viên trong lop.sinhvien_set lọc active true
                     ]
        q = request.query_params.get('ho_ten')
        if q:
            sinhviens = sinhviens.filter(ho_ten__icontains=q)
        return Response(serializers.SinhVienSerializer(sinhviens, many=True).data,
                        status=status.HTTP_200_OK)


class HocKyNamHocViewset(viewsets.ViewSet, generics.RetrieveAPIView):
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


class DieuViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Dieu.objects.filter(active=True)
    serializer_class = serializers.DieuSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        (self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien,
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


class HoatDongNgoaiKhoaViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView,
                               generics.DestroyAPIView):
    queryset = HoatDongNgoaiKhoa.objects.filter(active=True)
    serializer_class = serializers.HoatDongNgoaiKhoaSerializer

    def get_queryset(self):
        queryset = self.queryset
        #if self.action == 'list':
        q = self.request.query_params.get('ten_HD_NgoaiKhoa')
        if q:
           queryset = queryset.filter(ten_HD_NgoaiKhoa__icontains=q)

        return queryset

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


class BaiVietViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView, generics.RetrieveAPIView):
    queryset = BaiViet.objects.prefetch_related('tags').filter(active=True)
    serializer_class = serializers.BaivietTagSerializer

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
                                                       TaiKhoan.Roles.ADMIN.value]):
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

        tag = self.request.query_params.get("tag")
        if tag:
            tag_ids = Tag.objects.filter(name__icontains=tag).values_list('id', flat=True)
            queries = queries.filter(tags__in=tag_ids)

        return queries

    @action(methods=['get'], url_path="comments", detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.select_related('tai_khoan').all()

        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path="comments", detail=True)
    def add_comment(self, request, pk):
        c = Comment.objects.create(tai_khoan=request.user, bai_viet=self.get_object(), content=request.data.get('content'))

        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='likes', detail=True)
    def like(self, request, pk):
        li, created = Like.objects.get_or_create(bai_viet=self.get_object(), tai_khoan=request.user)

        if not created:
            li.active = not li.active
            li.save()

        return Response(
            serializers.AuthenticatedBaiVietTagSerializer(self.get_object(), context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='tac_gia', detail=True)
    def get_tacgia(self, request, pk):
        baiviet = self.get_object()
        tacgia = TaiKhoan.objects.get(id=baiviet.id)
        return Response(serializers.TaiKhoanSerializer(tacgia).data, status=status.HTTP_200_OK)


class TagViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializier

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if isinstance(self.request.user, AnonymousUser):
                return [permissions.IsAuthenticated()]
            else:
                if (self.request.user.is_authenticated and
                        self.request.user.role in [TaiKhoan.Roles.CongTacSinhVien.value,
                                                   TaiKhoan.Roles.TroLySinhVien.value,
                                                   TaiKhoan.Roles.ADMIN.value]):
                    return [permissions.IsAuthenticated()]
                else:
                    raise exceptions.PermissionDenied()

        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(name__icontains=q)

        return queryset

    @action(methods=['get'], url_path='baiviets', detail=True)
    def get_baiviet(self, request, pk):
        baiviet = self.get_object().baiviets.all()
        return Response(serializers.BaiVietSerializer(baiviet, many=True).data,
                        status=status.HTTP_200_OK)


class CommentViewset(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.CommentOwner]


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


class ThamGiaViewSet(viewsets.ViewSet, generics.ListAPIView):
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