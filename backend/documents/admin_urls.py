from django.urls import path
from .views import AdminDocumentListCreateView, AdminDocumentDetailView

urlpatterns = [
    path('', AdminDocumentListCreateView.as_view(), name='admin_documents_list_create'),
    path('<int:doc_id>/', AdminDocumentDetailView.as_view(), name='admin_document_detail'),
]
