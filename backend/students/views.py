from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import StudentProfile
from .serializers import StudentAdminSerializer
from accounts.permissions import IsAcademyAdmin

class AdminStudentListCreateView(APIView):
    """
    Admin endpoint to list all registered students or create a new student.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        level = request.query_params.get('level', '').strip()

        queryset = StudentProfile.objects.filter(user__role='STUDENT').select_related('user').order_by('-created_at')

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(mobile_number__icontains=search) |
                Q(student_id__icontains=search) |
                Q(standard__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        if level:
            queryset = queryset.filter(abacus_level=level)

        serializer = StudentAdminSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = StudentAdminSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response(StudentAdminSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminStudentDetailView(APIView):
    """
    Admin endpoint to retrieve, update, or delete a student.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, pk):
        profile = get_object_or_404(StudentProfile, pk=pk)
        serializer = StudentAdminSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        profile = get_object_or_404(StudentProfile, pk=pk)
        serializer = StudentAdminSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(StudentAdminSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        profile = get_object_or_404(StudentProfile, pk=pk)
        if profile.user:
            profile.user.delete()
        else:
            profile.delete()
        return Response({'message': 'Student removed successfully.'}, status=status.HTTP_200_OK)


from spoken_english.models import SpokenEnglishTestAttempt

class StudentSpokenTestHistoryView(APIView):
    """Admin endpoint to view a specific student's spoken english test history."""
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, student_id):
        student = get_object_or_404(StudentProfile, id=student_id)
        attempts = SpokenEnglishTestAttempt.objects.filter(
            student=student
        ).select_related('test_module').prefetch_related('recordings').order_by('-started_at')
        
        # Return list of test attempts with module info and scores
        data = []
        for attempt in attempts:
            scored_count = attempt.recordings.filter(teacher_score__isnull=False).count()
            data.append({
                'id': attempt.id,
                'module_id': attempt.test_module_id,
                'module_title': attempt.test_module.title if attempt.test_module else 'Unknown',
                'started_at': attempt.started_at,
                'submitted_at': attempt.submitted_at,
                'scored_at': attempt.scored_at,
                'status': attempt.status,
                'total_items': attempt.total_items,
                'recorded_items': attempt.recorded_items,
                'scored_items': scored_count,
                'overall_score': attempt.overall_score,
            })
        
        return Response({
            'student_id': student.id,
            'student_name': student.full_name,
            'test_history': data
        })

