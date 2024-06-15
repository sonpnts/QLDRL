import firebase_admin
from firebase_admin import credentials

# Đường dẫn tới tệp JSON của bạn
cred = credentials.Certificate('trainingpoint/firebase/qldrl-77e59-firebase-adminsdk-6tt21-9c80f40850.json')

# Khởi tạo ứng dụng Firebase
firebase_admin.initialize_app(cred)