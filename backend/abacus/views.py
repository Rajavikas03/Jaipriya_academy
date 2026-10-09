from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import AbacusTest, AbacusQuestion, AbacusAttempt, AbacusAnswer
from .serializers import (
    AbacusTestListSerializer,
    AbacusTestDetailSerializer,
    AbacusAttemptDetailSerializer,
    AbacusAnswerSaveSerializer,
    AbacusResultSerializer,
    AdminTestCreateSerializer,
    AdminTestScoreItemSerializer,
)
from accounts.permissions import IsAcademyAdmin
from django.db.models import Case, When, IntegerField
from students.models import StudentProfile, ABACUS_LEVEL_CHOICES

# ==========================================
# Student Views (Restricted to Assigned Level)
# ==========================================

class MyLevelView(APIView):
    """
    Returns the student's assigned Abacus level.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
            return Response({
                'abacus_level': profile.abacus_level,
                'abacus_level_display': profile.get_abacus_level_display() if profile.abacus_level else None,
                'has_assigned_level': bool(profile.abacus_level),
                'full_name': profile.full_name or f"{request.user.first_name} {request.user.last_name}".strip(),
                'standard': profile.standard,
            }, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response({
                'abacus_level': None,
                'abacus_level_display': None,
                'has_assigned_level': False,
                'full_name': request.user.username,
                'standard': None,
            }, status=status.HTTP_200_OK)


def get_allowed_levels(student_level):
    if not student_level:
        return []
    level_order = [choice[0] for choice in ABACUS_LEVEL_CHOICES]
    try:
        idx = level_order.index(student_level)
        return level_order[:idx + 1]
    except ValueError:
        return []

def get_level_ordering():
    level_order = [choice[0] for choice in ABACUS_LEVEL_CHOICES]
    return Case(
        *[When(level=level, then=idx) for idx, level in enumerate(level_order)],
        default=999,
        output_field=IntegerField()
    )


class AvailableTestsView(APIView):
    """
    Returns active Abacus tests strictly matching the logged-in student's assigned level and lower levels.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
            allowed_levels = get_allowed_levels(profile.abacus_level)
            if not allowed_levels:
                return Response([], status=status.HTTP_200_OK)

            tests = AbacusTest.objects.filter(
                level__in=allowed_levels, 
                is_active=True
            ).prefetch_related('questions', 'attempts').annotate(
                level_sort=get_level_ordering()
            ).order_by('level_sort', 'id')
            
            serializer = AbacusTestListSerializer(tests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)


class TestDetailView(APIView):
    """
    Returns detailed test metadata and questions for the student's assigned level.
    Never exposes correct_option.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, test_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        test = get_object_or_404(AbacusTest.objects.prefetch_related('questions'), id=test_id, is_active=True)

        allowed_levels = get_allowed_levels(profile.abacus_level)
        if test.level not in allowed_levels and not request.user.is_academy_admin():
            return Response(
                {'detail': 'You do not have permission to access tests from this Abacus level.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AbacusTestDetailSerializer(test)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StartTestView(APIView):
    """
    Starts an Abacus test attempt or returns an existing in-progress attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, test_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        test = get_object_or_404(AbacusTest, id=test_id, is_active=True)

        allowed_levels = get_allowed_levels(profile.abacus_level)
        if test.level not in allowed_levels and not request.user.is_academy_admin():
            return Response(
                {'detail': 'You can only take tests that match your assigned Abacus level.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check for existing IN_PROGRESS attempt
        active_attempt = AbacusAttempt.objects.filter(
            student=profile,
            test=test,
            status=AbacusAttempt.STATUS_IN_PROGRESS
        ).first()

        if active_attempt:
            # If expired, auto-submit previous attempt and start a fresh one
            if active_attempt.is_expired:
                active_attempt.evaluate(auto=True)
            else:
                serializer = AbacusAttemptDetailSerializer(active_attempt)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new attempt
        new_attempt = AbacusAttempt.objects.create(
            student=profile,
            test=test,
            status=AbacusAttempt.STATUS_IN_PROGRESS
        )

        serializer = AbacusAttemptDetailSerializer(new_attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttemptDetailView(APIView):
    """
    Retrieves active attempt status, questions, saved answers, and server remaining time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(
            AbacusAttempt.objects.select_related('student', 'student__user', 'test').prefetch_related('answers', 'test__questions'),
            id=attempt_id,
            student=profile
        )

        # Handle time expiration check on server
        if attempt.status == AbacusAttempt.STATUS_IN_PROGRESS and attempt.is_expired:
            attempt.evaluate(auto=True)

        serializer = AbacusAttemptDetailSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SaveAnswerView(APIView):
    """
    Saves or updates a student's answer for a single MCQ question during an active attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(AbacusAttempt, id=attempt_id, student=profile)

        if attempt.status != AbacusAttempt.STATUS_IN_PROGRESS:
            return Response(
                {'detail': 'This test attempt is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attempt.is_expired:
            attempt.evaluate(auto=True)
            return Response(
                {'detail': 'Time has expired for this test. Attempt has been submitted automatically.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AbacusAnswerSaveSerializer(data=request.data)
        if serializer.is_valid():
            question_id = serializer.validated_data['question_id']
            selected_option = serializer.validated_data.get('selected_option')

            question = get_object_or_404(AbacusQuestion, id=question_id, test=attempt.test)

            answer, _ = AbacusAnswer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={'selected_option': selected_option or None}
            )

            return Response({
                'success': True,
                'question_id': question.id,
                'selected_option': answer.selected_option,
                'remaining_seconds': attempt.remaining_seconds
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitTestView(APIView):
    """
    Evaluates test answers on the backend and produces final results.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(
            AbacusAttempt.objects.select_related('student', 'student__user', 'test').prefetch_related('answers', 'test__questions'),
            id=attempt_id,
            student=profile
        )

        if attempt.status in [AbacusAttempt.STATUS_SUBMITTED, AbacusAttempt.STATUS_AUTO_SUBMITTED]:
            serializer = AbacusResultSerializer(attempt)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Check if time expired
        is_auto = attempt.is_expired
        attempt.evaluate(auto=is_auto)

        serializer = AbacusResultSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResultView(APIView):
    """
    Returns summary results for a completed attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(
            AbacusAttempt.objects.select_related('student', 'student__user', 'test').prefetch_related('answers', 'test__questions'),
            id=attempt_id,
            student=profile
        )

        if attempt.status == AbacusAttempt.STATUS_IN_PROGRESS:
            if attempt.is_expired:
                attempt.evaluate(auto=True)
            else:
                return Response(
                    {'detail': 'Test attempt is currently in progress.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = AbacusResultSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# Admin Views (Question Upload & Test Scores)
# ==========================================

class AdminTestListCreateView(APIView):
    """
    Admin endpoint to view all published tests across all levels or create a new test with questions.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        level = request.query_params.get('level', '').strip()
        queryset = AbacusTest.objects.all().prefetch_related('questions', 'attempts').order_by('-created_at')
        if level:
            queryset = queryset.filter(level=level)

        serializer = AbacusTestListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save()
            return Response({
                'message': 'Test published successfully.',
                'test': AbacusTestListSerializer(test).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTestScoresView(APIView):
    """
    Admin endpoint to retrieve all student scores for a given test.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, test_id):
        test = get_object_or_404(AbacusTest, id=test_id)
        attempts = AbacusAttempt.objects.filter(
            test=test, 
            status__in=[AbacusAttempt.STATUS_SUBMITTED, AbacusAttempt.STATUS_AUTO_SUBMITTED]
        ).select_related('student', 'student__user').order_by('-submitted_at')

        serializer = AdminTestScoreItemSerializer(attempts, many=True)
        return Response({
            'test_id': test.id,
            'test_title': test.title,
            'level': test.level,
            'level_display': test.get_level_display(),
            'total_submissions': attempts.count(),
            'scores': serializer.data
        }, status=status.HTTP_200_OK)
