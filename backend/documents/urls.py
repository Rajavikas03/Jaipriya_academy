from django.urls import path
from .views import StudentDocumentListView

urlpatterns = [
    path('', StudentDocumentListView.as_view(), name='student_documents'),
]
