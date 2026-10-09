from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import (
    StudentLoginSerializer,
    AdminLoginSerializer,
    UserMeSerializer,
)

class StudentLoginView(APIView):
    """
    Passwordless Student Login endpoint.
    Accepts mobile_number, verifies student existence, and returns JWT tokens + student details.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(APIView):
    """
    Admin Login endpoint.
    Accepts mobile_number & password, verifies ACADEMY_ADMIN role, and returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    Returns the profile and role details of the currently authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
