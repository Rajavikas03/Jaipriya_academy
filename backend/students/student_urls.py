from django.urls import path
from .progress_views import StudentProgressView

urlpatterns = [
    path('progress/', StudentProgressView.as_view(), name='student_progress'),
]
