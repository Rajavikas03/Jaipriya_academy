from django.urls import path
from .views import (
    AdminStudentListCreateView,
    AdminStudentDetailView,
    StudentSpokenTestHistoryView,
)

urlpatterns = [
    path('', AdminStudentListCreateView.as_view(), name='admin_students_list_create'),
    path('<int:pk>/', AdminStudentDetailView.as_view(), name='admin_student_detail'),
    path('<int:student_id>/spoken-test-history/', StudentSpokenTestHistoryView.as_view(), name='student_spoken_test_history'),
]

