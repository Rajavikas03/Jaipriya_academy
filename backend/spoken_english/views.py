from rest_framework import status, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    SpokenEnglishContent,
    SpokenEnglishPracticeAttempt,
    SpokenEnglishTestAttempt,
    SpokenEnglishTestRecording,
    SpokenEnglishTopic,
    TheorySection,
    SpokenEnglishQuestion,
    SpokenEnglishAttempt,
    SpokenEnglishAnswer,
)
from .serializers import (
    SpokenEnglishTheoryContentSerializer,
    SpokenEnglishPracticeContentSerializer,
    SpokenEnglishTestContentPublicSerializer,
    SpokenEnglishPracticeAttemptSerializer,
    SpokenEnglishTestAttemptSerializer,
    SpokenEnglishTestAttemptDetailSerializer,
    SpokenEnglishTestRecordingSerializer,
    SpokenEnglishTopicListSerializer,
    SpokenEnglishTopicDetailSerializer,
    TheorySectionSerializer,
    SpokenEnglishAttemptSerializer,
    SpokenEnglishResultSerializer,
)
from .services.pronunciation_service import evaluate_spoken_recording, evaluate_test_attempt
from students.models import StudentProfile

from .module_serializers import SpokenEnglishModulePublicSerializer
def get_student_profile(user):
    return getattr(user, 'student_profile', None)


# ==========================================
# Batch 6: Modern Spoken English Views
# ==========================================

class SpokenEnglishTheoryListView(APIView):
    """
    Returns Theory items (Read + Listen mode).
    Includes reference audio and text.
    Query param `content_type` can filter by WORD, SENTENCE, or PARAGRAPH.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        content_type = request.query_params.get('content_type', '').upper()
        queryset = SpokenEnglishContent.objects.filter(
            section_type=SpokenEnglishContent.SECTION_THEORY,
            is_active=True
        )
        if content_type in ['WORD', 'SENTENCE', 'PARAGRAPH']:
            queryset = queryset.filter(content_type=content_type)
            
        serializer = SpokenEnglishTheoryContentSerializer(
            queryset.order_by('order', 'id'),
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class SpokenEnglishPracticeListView(APIView):
    """
    Returns Practice items (Read + Listen + Record mode).
    Includes reference audio, text, and student's latest practice recording.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        content_type = request.query_params.get('content_type', '').upper()
        queryset = SpokenEnglishContent.objects.filter(
            section_type=SpokenEnglishContent.SECTION_PRACTICE,
            is_active=True
        ).prefetch_related('practice_attempts')
        if content_type in ['WORD', 'SENTENCE', 'PARAGRAPH']:
            queryset = queryset.filter(content_type=content_type)

        serializer = SpokenEnglishPracticeContentSerializer(
            queryset.order_by('order', 'id'),
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class SpokenEnglishPracticeRecordView(APIView):
    """
    Uploads a student's practice recording for a specific practice item.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, content_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        content_item = get_object_or_404(
            SpokenEnglishContent,
            id=content_id,
            section_type=SpokenEnglishContent.SECTION_PRACTICE,
            is_active=True
        )

        audio_file = request.FILES.get('recorded_audio')
        if not audio_file:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create or update practice attempt
        attempt = SpokenEnglishPracticeAttempt.objects.create(
            student=student,
            content_item=content_item,
            recorded_audio=audio_file,
            status='RECORDED',
            feedback='Practice recording saved successfully.'
        )

        serializer = SpokenEnglishPracticeAttemptSerializer(attempt, context={'request': request})
        return Response({
            'message': 'Practice recording saved successfully.',
            'recording': serializer.data
        }, status=status.HTTP_201_CREATED)


class SpokenEnglishTestItemsView(APIView):
    """
    Returns Test items (Read + Record + Evaluate mode).
    STRICTLY EXCLUDES reference audio.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        content_type = request.query_params.get('content_type', '').upper()
        module_id = request.query_params.get('module_id')
        
        queryset = SpokenEnglishContent.objects.filter(
            section_type=SpokenEnglishContent.SECTION_TEST,
            is_active=True
        )
        if content_type in ['WORD', 'SENTENCE', 'PARAGRAPH']:
            queryset = queryset.filter(content_type=content_type)
            
        if module_id:
            queryset = queryset.filter(module_id=module_id)

        serializer = SpokenEnglishTestContentPublicSerializer(
            queryset.order_by('order', 'id'),
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class SpokenEnglishTestStartView(APIView):
    """
    Starts an independent Spoken English test assessment.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        module_id = request.data.get('module_id')
        if not module_id:
            return Response({'error': 'module_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # We must import SpokenEnglishModule or assume it's imported.
        # Wait, I didn't import it at the top of the file! I'll need to do that. Let's just do an inline import or update the top imports in a separate call.
        from .models import SpokenEnglishModule
        module = get_object_or_404(
            SpokenEnglishModule, 
            id=module_id, 
            section_type=SpokenEnglishModule.SECTION_TEST, 
            is_active=True
        )

        content_type = request.data.get('content_type', 'ALL').upper()
        if content_type not in ['ALL', 'WORD', 'SENTENCE', 'PARAGRAPH']:
            content_type = 'ALL'

        items_qs = module.items.filter(is_active=True)
        if content_type != 'ALL':
            items_qs = items_qs.filter(content_type=content_type)

        total_items = items_qs.count()
        if total_items == 0:
            return Response({'error': 'No test questions available for this module.'}, status=status.HTTP_400_BAD_REQUEST)

        attempt = SpokenEnglishTestAttempt.objects.create(
            student=student,
            test_module=module,
            content_type=content_type,
            total_items=total_items,
            status=SpokenEnglishTestAttempt.STATUS_IN_PROGRESS
        )

        return Response({
            'message': 'Test attempt started.',
            'attempt_id': attempt.id,
            'module_id': module.id,
            'module_title': module.title,
            'content_type': content_type,
            'total_items': total_items,
        }, status=status.HTTP_201_CREATED)


class SpokenEnglishTestRecordItemView(APIView):
    """
    Saves a student recording for a specific test item in an active test attempt.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, attempt_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        attempt = get_object_or_404(
            SpokenEnglishTestAttempt,
            id=attempt_id,
            student=student,
            status=SpokenEnglishTestAttempt.STATUS_IN_PROGRESS
        )

        content_item_id = request.data.get('content_item_id')
        audio_file = request.FILES.get('recorded_audio')

        if not content_item_id or not audio_file:
            return Response({'error': 'content_item_id and recorded_audio are required.'}, status=status.HTTP_400_BAD_REQUEST)

        content_item = get_object_or_404(
            SpokenEnglishContent,
            id=content_item_id,
            section_type=SpokenEnglishContent.SECTION_TEST
        )

        # Create or update recording for this item
        recording, created = SpokenEnglishTestRecording.objects.update_or_create(
            test_attempt=attempt,
            content_item=content_item,
            defaults={
                'recorded_audio': audio_file,
                'status': 'RECORDED'
            }
        )

        # Update recorded count on attempt
        attempt.recorded_items = attempt.recordings.count()
        attempt.save()

        serializer = SpokenEnglishTestRecordingSerializer(recording, context={'request': request})
        return Response({
            'message': 'Recording uploaded successfully.',
            'recording': serializer.data,
            'recorded_items': attempt.recorded_items,
            'total_items': attempt.total_items
        }, status=status.HTTP_200_OK)


class SpokenEnglishTestSubmitView(APIView):
    """
    Submits the test attempt for manual teacher evaluation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        attempt = get_object_or_404(
            SpokenEnglishTestAttempt.objects.select_related('student', 'student__user').prefetch_related('recordings__content_item'),
            id=attempt_id,
            student=student
        )

        if attempt.status in [
            SpokenEnglishTestAttempt.STATUS_SUBMITTED,
            SpokenEnglishTestAttempt.STATUS_UNDER_REVIEW,
            SpokenEnglishTestAttempt.STATUS_PARTIALLY_SCORED,
            SpokenEnglishTestAttempt.STATUS_SCORED,
            SpokenEnglishTestAttempt.STATUS_PENDING_EVALUATION,
            SpokenEnglishTestAttempt.STATUS_EVALUATED
        ]:
            serializer = SpokenEnglishTestAttemptDetailSerializer(attempt, context={'request': request})
            return Response({
                'message': 'Test already submitted.',
                'result': serializer.data
            }, status=status.HTTP_200_OK)

        attempt.submitted_at = timezone.now()
        attempt.recorded_items = attempt.recordings.count()
        attempt.status = SpokenEnglishTestAttempt.STATUS_SUBMITTED
        attempt.overall_score = None
        attempt.save()

        serializer = SpokenEnglishTestAttemptDetailSerializer(attempt, context={'request': request})
        return Response({
            'message': 'Test submitted successfully. Your voice recordings have been sent for teacher review.',
            'result': serializer.data
        }, status=status.HTTP_200_OK)


class SpokenEnglishTestResultView(APIView):
    """
    Retrieves the full result, metrics, and recordings for a student test attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        student = get_student_profile(request.user)
        if not student and not getattr(request.user, 'role', '') == 'ACADEMY_ADMIN':
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if getattr(request.user, 'role', '') == 'ACADEMY_ADMIN':
            attempt = get_object_or_404(
                SpokenEnglishTestAttempt.objects.select_related('student', 'student__user').prefetch_related('recordings__content_item'),
                id=attempt_id
            )
        else:
            attempt = get_object_or_404(
                SpokenEnglishTestAttempt.objects.select_related('student', 'student__user').prefetch_related('recordings__content_item'),
                id=attempt_id,
                student=student
            )

        serializer = SpokenEnglishTestAttemptDetailSerializer(attempt, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# Legacy Topic/MCQ Views (Preserved for compatibility)
# ==========================================

class TopicListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        topics = SpokenEnglishTopic.objects.filter(is_active=True).prefetch_related('theory_sections', 'questions')
        serializer = SpokenEnglishTopicListSerializer(topics, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TopicDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id, is_active=True)
        serializer = SpokenEnglishTopicDetailSerializer(topic)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TheorySectionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id, is_active=True)
        sections = topic.theory_sections.all().order_by('order', 'id')
        serializer = TheorySectionSerializer(sections, many=True)
        return Response({
            'topic_id': topic.id,
            'topic_title': topic.title,
            'sections': serializer.data
        }, status=status.HTTP_200_OK)


class StartPracticeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, topic_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        topic = get_object_or_404(SpokenEnglishTopic, id=topic_id, is_active=True)
        attempt = SpokenEnglishAttempt.objects.create(
            student=student,
            topic=topic,
            total_questions=topic.questions.count(),
            status=SpokenEnglishAttempt.STATUS_IN_PROGRESS
        )

        return Response({
            'attempt_id': attempt.id,
            'topic_id': topic.id,
            'topic_title': topic.title,
            'started_at': attempt.started_at,
        }, status=status.HTTP_201_CREATED)


class AttemptDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        attempt = get_object_or_404(SpokenEnglishAttempt, id=attempt_id, student=student)
        serializer = SpokenEnglishAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SaveAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        student = get_student_profile(request.user)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        attempt = get_object_or_404(
            SpokenEnglishAttempt,
            id=attempt_id,
            student=student,
            status=SpokenEnglishAttempt.STATUS_IN_PROGRESS
        )

        question_id = request.data.get('question_id')
        selected_option = request.data.get('selected_option', '')

        question = get_object_or_404(SpokenEnglishQuestion, id=question_id, topic=attempt.topic)

        if selected_option:
            selected_option = selected_option.upper()

        SpokenEnglishAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={'selected_option': selected_option or None}
        )

        return Response({'message': 'Answer recorded.'}, status=status.HTTP_200_OK)



class SubmitPracticeView(APIView):
    """
    Evaluates MCQ practice answers on the backend and produces final results.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(SpokenEnglishAttempt, id=attempt_id, student=profile)

        if attempt.status == SpokenEnglishAttempt.STATUS_SUBMITTED:
            serializer = SpokenEnglishResultSerializer(attempt)
            return Response(serializer.data, status=status.HTTP_200_OK)

        attempt.evaluate()
        serializer = SpokenEnglishResultSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResultView(APIView):
    """
    Returns score results for a completed Spoken English attempt.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        profile = get_object_or_404(StudentProfile, user=request.user)
        attempt = get_object_or_404(SpokenEnglishAttempt, id=attempt_id, student=profile)

        if attempt.status == SpokenEnglishAttempt.STATUS_IN_PROGRESS:
            return Response(
                {'detail': 'Practice attempt is still in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SpokenEnglishResultSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

