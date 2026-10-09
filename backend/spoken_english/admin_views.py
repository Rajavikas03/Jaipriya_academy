from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (
    SpokenEnglishContent,
    SpokenEnglishPracticeAttempt,
    SpokenEnglishTestAttempt,
    SpokenEnglishTestRecording,
    SpokenEnglishTopic,
    SpokenEnglishAttempt,
)
from .serializers import (
    AdminSpokenEnglishContentSerializer,
    SpokenEnglishTestAttemptSerializer,
    SpokenEnglishTestAttemptDetailSerializer,
    SpokenEnglishTestRecordingSerializer,
    AdminSpokenEnglishPracticeScoreSerializer,
    SpokenEnglishTopicListSerializer,
    AdminTopicCreateUpdateSerializer,
    AdminSpokenScoreItemSerializer,
    TheorySectionSerializer,
)
from accounts.permissions import IsAcademyAdmin


# ==========================================
# Batch 6: Modern Admin Spoken English Views
# ==========================================

class AdminSpokenEnglishContentListCreateView(APIView):
    """
    Admin endpoint to view all content items (Theory, Practice, Test) and upload new content with audio/image.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request):
        section_type = request.query_params.get('section_type', '').upper()
        content_type = request.query_params.get('content_type', '').upper()

        queryset = SpokenEnglishContent.objects.all()
        if section_type in ['THEORY', 'PRACTICE', 'TEST']:
            queryset = queryset.filter(section_type=section_type)
        if content_type in ['WORD', 'SENTENCE', 'PARAGRAPH']:
            queryset = queryset.filter(content_type=content_type)

        queryset = queryset.order_by('section_type', 'content_type', 'order', '-created_at')
        serializer = AdminSpokenEnglishContentSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminSpokenEnglishContentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'message': 'Content item created successfully.',
                'item': AdminSpokenEnglishContentSerializer(item, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSpokenEnglishContentDetailView(APIView):
    """
    Admin endpoint to retrieve, update, or delete a Spoken English content item.
    Requires role = ACADEMY_ADMIN.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get(self, request, item_id):
        item = get_object_or_404(SpokenEnglishContent, id=item_id)
        serializer = AdminSpokenEnglishContentSerializer(item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, item_id):
        item = get_object_or_404(SpokenEnglishContent, id=item_id)
        serializer = AdminSpokenEnglishContentSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_item = serializer.save()
            return Response({
                'message': 'Content item updated successfully.',
                'item': AdminSpokenEnglishContentSerializer(updated_item, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, item_id):
        return self.put(request, item_id)

    def delete(self, request, item_id):
        item = get_object_or_404(SpokenEnglishContent, id=item_id)
        item.delete()
        return Response({'message': 'Content item deleted successfully.'}, status=status.HTTP_200_OK)


class AdminSpokenEnglishTestScoresView(APIView):
    """
    Admin endpoint to view all student test attempts and their submitted audio recordings.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        attempts = SpokenEnglishTestAttempt.objects.all().select_related(
            'student', 'student__user'
        ).prefetch_related('recordings').order_by('-started_at')

        serializer = SpokenEnglishTestAttemptSerializer(attempts, many=True, context={'request': request})
        return Response({
            'total_test_attempts': attempts.count(),
            'attempts': serializer.data
        }, status=status.HTTP_200_OK)


class AdminSpokenEnglishTestScoreDetailView(APIView):
    """
    Admin endpoint to view student test attempt details and listen to every recording.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(
            SpokenEnglishTestAttempt.objects.select_related('student', 'student__user').prefetch_related('recordings__content_item'),
            id=attempt_id
        )
        serializer = SpokenEnglishTestAttemptDetailSerializer(attempt, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminSpokenEnglishScoreRecordingView(APIView):
    """
    Teacher/Admin endpoint to assign a manual score (0 to 100) to a student's test question recording.
    PATCH /api/admin/spoken-english/test-recordings/<recording_id>/score/
    Payload: { "teacher_score": 85 }
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def patch(self, request, recording_id):
        recording = get_object_or_404(
            SpokenEnglishTestRecording.objects.select_related('test_attempt', 'content_item', 'test_attempt__student'),
            id=recording_id
        )

        score_raw = request.data.get('teacher_score')
        if score_raw is None:
            return Response({'error': 'teacher_score is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher_score = float(score_raw)
        except (ValueError, TypeError):
            return Response({'error': 'teacher_score must be a valid numeric value.'}, status=status.HTTP_400_BAD_REQUEST)

        if teacher_score < 0 or teacher_score > 100:
            return Response({'error': 'teacher_score must be between 0 and 100.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update recording
        from django.utils import timezone
        recording.teacher_score = round(teacher_score, 1)
        recording.scored_at = timezone.now()
        recording.status = 'SCORED'
        recording.save()

        # Update test attempt overall status and overall score
        attempt = recording.test_attempt
        attempt.calculate_overall_score()

        return Response({
            'message': 'Score saved successfully.',
            'recording_id': recording.id,
            'teacher_score': recording.teacher_score,
            'attempt_status': attempt.status,
            'overall_score': attempt.overall_score,
            'scored_recordings_count': attempt.recordings.filter(teacher_score__isnull=False).count(),
            'total_items': attempt.total_items,
            'attempt': SpokenEnglishTestAttemptSerializer(attempt, context={'request': request}).data,
            'recording': SpokenEnglishTestRecordingSerializer(recording, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

    def post(self, request, recording_id):
        return self.patch(request, recording_id)


class AdminSpokenEnglishPracticeHistoryView(APIView):
    """
    Admin endpoint to view all student self-practice recordings with audio player URLs.
    """
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        practices = SpokenEnglishPracticeAttempt.objects.all().select_related(
            'student', 'student__user', 'content_item'
        ).order_by('-submitted_at')

        serializer = AdminSpokenEnglishPracticeScoreSerializer(practices, many=True, context={'request': request})
        return Response({
            'total_practices': practices.count(),
            'practices': serializer.data
        }, status=status.HTTP_200_OK)


# ==========================================
# Legacy Admin Views (Preserved for compatibility)
# ==========================================

class AdminTopicListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request):
        topics = SpokenEnglishTopic.objects.all().prefetch_related('theory_sections', 'questions', 'attempts').order_by('order', '-created_at')
        serializer = SpokenEnglishTopicListSerializer(topics, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminTopicCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            topic = serializer.save()
            return Response({
                'message': 'Topic saved successfully.',
                'topic': SpokenEnglishTopicListSerializer(topic).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTopicDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id)
        sections = TheorySectionSerializer(topic.theory_sections.all().order_by('order', 'id'), many=True).data
        questions = [
            {
                'id': q.id,
                'question_text': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'correct_option': q.correct_option,
                'order': q.order,
            }
            for q in topic.questions.all().order_by('order', 'id')
        ]
        return Response({
            'id': topic.id,
            'title': topic.title,
            'description': topic.description,
            'order': topic.order,
            'is_active': topic.is_active,
            'theory_sections': sections,
            'questions': questions,
        }, status=status.HTTP_200_OK)

    def put(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id)
        serializer = AdminTopicCreateUpdateSerializer(topic, data=request.data, partial=True)
        if serializer.is_valid():
            updated_topic = serializer.save()
            return Response({
                'message': 'Topic updated successfully.',
                'topic': SpokenEnglishTopicListSerializer(updated_topic).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, topic_id):
        return self.put(request, topic_id)

    def delete(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id)
        topic.delete()
        return Response({'message': 'Topic deleted successfully.'}, status=status.HTTP_200_OK)


class AdminTopicScoresView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademyAdmin]

    def get(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id)
        attempts = SpokenEnglishAttempt.objects.filter(
            topic=topic,
            status=SpokenEnglishAttempt.STATUS_SUBMITTED
        ).select_related('student', 'student__user').order_by('-submitted_at')

        serializer = AdminSpokenScoreItemSerializer(attempts, many=True)
        return Response({
            'topic_id': topic.id,
            'topic_title': topic.title,
            'total_submissions': attempts.count(),
            'scores': serializer.data
        }, status=status.HTTP_200_OK)


