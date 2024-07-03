# Ứng Dụng Quản Lý Điểm Rèn Luyện Của Sinh Viên

## Giới Thiệu
Ứng dụng này giúp quản lý điểm rèn luyện của sinh viên, được phát triển bằng React Native cho phần giao diện và Django API cho phần server.

## Tính Năng
- Quản lý thông tin sinh viên
- Xem và cập nhật điểm rèn luyện
- Thống kê và báo cáo điểm rèn luyện

## Công Nghệ Sử Dụng
- **Frontend**: React Native
- **Backend**: Django REST Framework
- **Database**: MySQL
- **Authentication**: Django Outh2

## Cài Đặt và Sử Dụng

### Backend (Django API)
1. Clone repository:
    ```bash
    git clone https://github.com/sonpnts/QLDRL.git
    ```

2. Tạo và kích hoạt môi trường ảo:
    ```bash
    python3 -m venv env
    source env/bin/activate
    ```

3. Cài đặt các thư viện cần thiết:
    ```bash
    pip install -r requirements.txt
    ```

4. Thiết lập cơ sở dữ liệu:
   Tạo mới cơ sở dữ liệu với tên là: trainingpointdb
    ```bash
    Cập nhật mật khẩu và user name csdl trong file setting.py
    python manage.py migrate
    ```

6. Chạy server:
    ```bash
    python manage.py runserver
    ```

### Frontend (React Native)
1. Điều hướng đến thư mục frontend:
    ```bash
    cd ../trainingpointmobile
    ```

2. Cài đặt các gói cần thiết:
    ```bash
    npm install
    ```

3. Chạy ứng dụng:
    ```bash
    npm start
    ```

## Cấu Trúc Thư Mục





## Đóng Góp
1. Fork repository này.
2. Tạo một nhánh mới: `git checkout -b feature/your-feature-name`.
3. Commit thay đổi của bạn: `git commit -m 'Add some feature'`.
4. Push lên nhánh: `git push origin feature/your-feature-name`.
5. Tạo một pull request.

## Giấy Phép
Dự án này được cấp phép dưới [MIT License](LICENSE).
