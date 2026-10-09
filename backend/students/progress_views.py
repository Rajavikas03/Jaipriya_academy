from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from students.models import StudentProfile
from abacus.models import AbacusAttempt
from spoken_english.models import SpokenEnglishTestAttempt


class StudentProgressView(APIView):
    """Student endpoint to view their own test history/scores."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({'abacus_tests': [], 'spoken_english_tests': []}, status=status.HTTP_200_OK)

        # Abacus test history
        abacus_attempts = AbacusAttempt.objects.filter(
            student=profile,
            status__in=[AbacusAttempt.STATUS_SUBMITTED, AbacusAttempt.STATUS_AUTO_SUBMITTED]
        ).select_related('test').order_by('-submitted_at')

        abacus_data = []
        for attempt in abacus_attempts:
            abacus_data.append({
                'id': attempt.id,
                'test_title': attempt.test.title,
                'level': attempt.test.level,
                'level_display': attempt.test.get_level_display(),
                'total_questions': attempt.total_questions,
                'correct_answers': attempt.correct_answers,
                'incorrect_answers': attempt.incorrect_answers,
                'skipped_questions': attempt.skipped_questions,
                'score_display': f"{attempt.correct_answers} / {attempt.total_questions}",
                'status': attempt.status,
                'started_at': attempt.started_at,
                'submitted_at': attempt.submitted_at,
            })

        # Spoken English test history
        spoken_attempts = SpokenEnglishTestAttempt.objects.filter(
            student=profile
        ).exclude(
            status=SpokenEnglishTestAttempt.STATUS_IN_PROGRESS
        ).select_related('test_module').order_by('-started_at')

        spoken_data = []
        for attempt in spoken_attempts:
            is_scored = attempt.status == SpokenEnglishTestAttempt.STATUS_SCORED
            spoken_data.append({
                'id': attempt.id,
                'module_title': attempt.test_module.title if attempt.test_module else 'Unknown',
                'status': attempt.status,
                'status_display': attempt.get_status_display(),
                'overall_score': attempt.overall_score if is_scored else None,
                'total_items': attempt.total_items,
                'started_at': attempt.started_at,
                'submitted_at': attempt.submitted_at,
                'scored_at': attempt.scored_at,
                'is_evaluated': is_scored,
            })

        return Response({
            'abacus_tests': abacus_data,
            'spoken_english_tests': spoken_data,
        }, status=status.HTTP_200_OK)
