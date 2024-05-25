from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField


class TaiKhoan(AbstractUser):
    avatar = CloudinaryField('avatar', null=True, blank=True)

    class Roles(models.IntegerChoices):
        ADMIN = 1, 'Admin'
        CongTacSinhVien = 2, 'Cộng Tác Sinh Viên'
        TroLySinhVien = 3, 'Trợ Lý Sinh Viên'
        SinhVien = 4, 'Sinh Viên'

    role = models.IntegerField(choices=Roles.choices, null=True, blank=True)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if self.pk is None and self.password:
            self.set_password(self.password)
        super().save(*args, **kwargs)


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Khoa(BaseModel):
    ten_khoa = models.CharField(max_length=255)

    def __str__(self):
        return self.ten_khoa


class Lop(BaseModel):
    ten_lop = models.CharField(max_length=255)
    khoa = models.ForeignKey(Khoa, on_delete=models.PROTECT)

    def __str__(self):
        return self.ten_lop


class TroLySinhVien_Khoa(BaseModel):
    trolySV = models.ForeignKey(TaiKhoan, on_delete=models.CASCADE,
                                limit_choices_to={'role': TaiKhoan.Roles.TroLySinhVien})
    khoa = models.ForeignKey(Khoa, on_delete=models.CASCADE)


class SinhVien(BaseModel):
    mssv = models.CharField(max_length=10, unique=True)
    ho_ten = models.CharField(max_length=255)
    ngay_sinh = models.DateField()

    class GioiTinh(models.IntegerChoices):
        NAM = 1, 'Nam'
        NU = 2, 'Nữ'

    gioi_tinh = models.IntegerField(choices=GioiTinh.choices)
    email = models.EmailField(unique=True)
    dia_chi = models.TextField()
    lop = models.ForeignKey(Lop, on_delete=models.CASCADE)

    def __str__(self):
        return self.ho_ten


class HocKy_NamHoc(models.Model):
    class Meta:
        unique_together = ('hoc_ky', 'nam_hoc')

    class HocKy(models.IntegerChoices):
        MOT = 1, 'Một'
        HAI = 2, 'Hai'
        BA = 3, 'Ba'

    hoc_ky = models.IntegerField(choices=HocKy.choices)
    nam_hoc = models.CharField(max_length=9)

    def __str__(self):
        return f"{self.hoc_ky} - {self.nam_hoc}"


class Dieu(BaseModel):
    ma_dieu = models.CharField(max_length=10, unique=True)
    ten_dieu = models.CharField(max_length=255)

    def __str__(self):
        return self.ten_dieu


class HoatDongNgoaiKhoa(BaseModel):
    ten_HD_NgoaiKhoa = models.TextField()
    ngay_to_chuc = models.DateTimeField()
    thong_tin = RichTextField(null=True, blank=True)
    diem_ren_luyen = models.IntegerField(default=5)
    dieu = models.ForeignKey(Dieu, on_delete=models.CASCADE)
    hk_nh = models.ForeignKey(HocKy_NamHoc, on_delete=models.CASCADE)
    sinh_vien = models.ManyToManyField(SinhVien, through='ThamGia')

    def __str__(self):
        return self.ten_HD_NgoaiKhoa


class ThamGia(models.Model):
    sinh_vien = models.ForeignKey(SinhVien, on_delete=models.CASCADE)
    hd_ngoaikhoa = models.ForeignKey(HoatDongNgoaiKhoa, on_delete=models.CASCADE)

    class TrangThai(models.IntegerChoices):
        DangKy = 0, 'Đăng Ký'
        DiemDanh = 1, 'Điểm Danh'
        BaoThieu = 2, 'Báo Thiếu'

    trang_thai = models.IntegerField(choices=TrangThai.choices, null=True, blank=True)
    ngay_dang_ky = models.DateTimeField(auto_now_add=True)
    ngay_diem_danh = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sinh_vien.mssv} - {self.hd_ngoaikhoa.ten_HD_NgoaiKhoa}"


class MinhChung(BaseModel):
    description = RichTextField()
    anh_minh_chung = CloudinaryField('anh_minh_chung')
    tham_gia = models.ForeignKey(ThamGia, on_delete=models.CASCADE)


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class BaiViet(BaseModel):
    title = models.CharField(max_length=255)
    content = RichTextField(null=True, blank=True)
    image = CloudinaryField('image')
    tro_ly = models.ForeignKey(TaiKhoan, on_delete=models.CASCADE,
                               limit_choices_to={'role': TaiKhoan.Roles.TroLySinhVien})
    hd_ngoaikhoa = models.ForeignKey(HoatDongNgoaiKhoa, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, blank=True, related_name='baiviets')

    def __str__(self):
        return self.title


class Interaction(BaseModel):
    tai_khoan = models.ForeignKey(TaiKhoan, on_delete=models.CASCADE)
    bai_viet = models.ForeignKey(BaiViet, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)


class Like(Interaction):
    class Meta:
        unique_together = ('bai_viet', 'tai_khoan')


class DiemRenLuyen(BaseModel):
    sinh_vien = models.ForeignKey(SinhVien, on_delete=models.CASCADE)
    hk_nh = models.ForeignKey(HocKy_NamHoc, on_delete=models.CASCADE)
    diem_tong = models.IntegerField()

    class XepLoai(models.IntegerChoices):
        XUATSAC = 1, 'Xuất Sắc'
        GIOI = 2, 'Giỏi'
        KHA = 3, 'Khá'
        TB = 4, 'Trung Bình'
        YEU = 5, 'Yếu'
        KEM = 6, 'Kém'

    xep_loai = models.IntegerField(choices=XepLoai.choices)
