from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.response import Response

class SendEmailViewSet(viewsets.ViewSet):
    def create(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        recipient_list = [request.data.get('recipient')]
        sender = 'phamngoctruongson2003@gmail.com'  # Thay bằng email của bạn

        send_mail(subject, message, sender, recipient_list)
        return Response({'success': True})