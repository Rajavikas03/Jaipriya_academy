from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    StudentLoginView,
    AdminLoginView,
    MeView,
)

urlpatterns = [
    path('student-login/', StudentLoginView.as_view(), name='auth_student_login'),
    path('admin-login/', AdminLoginView.as_view(), name='auth_admin_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='auth_me'),
]
