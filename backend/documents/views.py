from rest_framework import permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.permissions import IsAcademyAdmin
from .models import Document


class StudentDocumentListView(APIView):
    """Students can view list of active documents."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        docs = Document.objects.filter(is_active=True)
        data = []
        for doc in docs:
            data.append({
                'id': doc.id,
                'title': doc.title,
                'description': doc.description,
                'file_url': request.build_absolute_uri(doc.file.url) if doc.file else None,
                'created_at': doc.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminDocumentListCreateView(APIView):
    """Admin: list all documents or upload a new one."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get(self, request):
        docs = Document.objects.all()
        data = []
        for doc in docs:
            data.append({
                'id': doc.id,
                'title': doc.title,
                'description': doc.description,
                'file_url': request.build_absolute_uri(doc.file.url) if doc.file else None,
                'is_active': doc.is_active,
                'created_at': doc.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        file = request.FILES.get('file')
        
        if not title:
            return Response({'detail': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not file:
            return Response({'detail': 'PDF file is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doc = Document(title=title, description=description, file=file)
            doc.full_clean()
            doc.save()
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'id': doc.id,
            'title': doc.title,
            'description': doc.description,
            'file_url': request.build_absolute_uri(doc.file.url),
            'is_active': doc.is_active,
            'created_at': doc.created_at,
        }, status=status.HTTP_201_CREATED)


class AdminDocumentDetailView(APIView):
    """Admin: view, update, or delete a document."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def delete(self, request, doc_id):
        doc = get_object_or_404(Document, id=doc_id)
        # Delete the file from disk
        if doc.file:
            doc.file.delete(save=False)
        doc.delete()
        return Response({'detail': 'Document deleted.'}, status=status.HTTP_200_OK)
