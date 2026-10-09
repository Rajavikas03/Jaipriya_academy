from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from accounts.permissions import IsAcademyAdmin
from .models import SpokenEnglishModule, SpokenEnglishContent
from .module_serializers import (
    SpokenEnglishModuleListSerializer,
    SpokenEnglishModulePublicSerializer,
    AdminSpokenEnglishModuleListSerializer,
    AdminSpokenEnglishModuleDetailSerializer,
    AdminSpokenEnglishModuleCreateSerializer
)
from .serializers import AdminSpokenEnglishContentSerializer


# Student views:
class SpokenEnglishModuleListView(APIView):
    """Public endpoint to list active modules, optionally filtered by section_type."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        section_type = request.query_params.get('section_type', '').upper()
        qs = SpokenEnglishModule.objects.filter(is_active=True)
        if section_type in dict(SpokenEnglishModule.SECTION_CHOICES):
            qs = qs.filter(section_type=section_type)
        serializer = SpokenEnglishModuleListSerializer(qs.order_by('order', 'id'), many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class SpokenEnglishModuleDetailView(APIView):
    """Public endpoint to retrieve a single active module with all its active items."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, module_id):
        module = get_object_or_404(SpokenEnglishModule, id=module_id, is_active=True)
        serializer = SpokenEnglishModulePublicSerializer(module, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# Admin views:
class AdminSpokenEnglishModuleListCreateView(APIView):
    """Admin: list all modules, create new module."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        modules = SpokenEnglishModule.objects.all().order_by('order', 'id')
        serializer = AdminSpokenEnglishModuleListSerializer(modules, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminSpokenEnglishModuleCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSpokenEnglishModuleDetailView(APIView):
    """Admin: retrieve, update, delete a module."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get_object(self, module_id):
        return get_object_or_404(SpokenEnglishModule, id=module_id)

    def get(self, request, module_id):
        module = self.get_object(module_id)
        serializer = AdminSpokenEnglishModuleDetailSerializer(module, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, module_id):
        module = self.get_object(module_id)
        serializer = AdminSpokenEnglishModuleCreateSerializer(module, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, module_id):
        module = self.get_object(module_id)
        module.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminModuleItemCreateView(APIView):
    """Admin: add a content item to an existing module."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request, module_id):
        module = get_object_or_404(SpokenEnglishModule, id=module_id)
        serializer = AdminSpokenEnglishContentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(module=module, section_type=module.section_type)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminModuleItemDetailView(APIView):
    """Admin: update or delete a specific item within a module."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self, module_id, item_id):
        return get_object_or_404(SpokenEnglishContent, id=item_id, module_id=module_id)

    def put(self, request, module_id, item_id):
        item = self.get_object(module_id, item_id)
        serializer = AdminSpokenEnglishContentSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, module_id, item_id):
        item = self.get_object(module_id, item_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
