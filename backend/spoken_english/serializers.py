from rest_framework import serializers
from django.db import transaction
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

# ==========================================
# Batch 6: Content & Assessment Serializers
# ==========================================

class SpokenEnglishTheoryContentSerializer(serializers.ModelSerializer):
    """
    Serializer for Theory mode (Read + Listen).
    Includes text, optional illustration image, and reference audio.
    """
    image_url = serializers.SerializerMethodField()
    reference_audio_url = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishContent
        fields = [
            'id',
            'section_type',
            'content_type',
            'title',
            'text_content',
            'image',
            'image_url',
            'reference_audio',
            'reference_audio_url',
            'order',
            'is_active',
            'created_at',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_reference_audio_url(self, obj):
        request = self.context.get('request')
        if obj.reference_audio:
            return request.build_absolute_uri(obj.reference_audio.url) if request else obj.reference_audio.url
        return None


class SpokenEnglishPracticeContentSerializer(serializers.ModelSerializer):
    """
    Serializer for Practice mode (Read + Listen + Record).
    Includes text, illustration, reference audio, and latest student practice recording.
    """
    image_url = serializers.SerializerMethodField()
    reference_audio_url = serializers.SerializerMethodField()
    latest_practice_recording = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishContent
        fields = [
            'id',
            'section_type',
            'content_type',
            'title',
            'text_content',
            'image',
            'image_url',
            'reference_audio',
            'reference_audio_url',
            'order',
            'is_active',
            'latest_practice_recording',
            'created_at',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_reference_audio_url(self, obj):
        request = self.context.get('request')
        if obj.reference_audio:
            return request.build_absolute_uri(obj.reference_audio.url) if request else obj.reference_audio.url
        return None

    def get_latest_practice_recording(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        student_profile = getattr(request.user, 'student_profile', None)
        if not student_profile:
            return None

        latest = obj.practice_attempts.filter(student=student_profile).first()
        if latest and latest.recorded_audio:
            return {
                'id': latest.id,
                'audio_url': request.build_absolute_uri(latest.recorded_audio.url),
                'status': latest.status,
                'feedback': latest.feedback,
                'submitted_at': latest.submitted_at,
            }
        return None


class SpokenEnglishTestContentPublicSerializer(serializers.ModelSerializer):
    """
    Serializer for Test mode (Read + Record + Evaluate).
    STRICTLY EXCLUDES reference_audio so student performs independent assessment.
    """
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishContent
        fields = [
            'id',
            'section_type',
            'content_type',
            'title',
            'text_content',
            'image_url',
            'order',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class SpokenEnglishPracticeAttemptSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishPracticeAttempt
        fields = [
            'id',
            'content_item',
            'recorded_audio',
            'audio_url',
            'status',
            'transcription',
            'feedback',
            'submitted_at',
        ]
        read_only_fields = ['id', 'audio_url', 'status', 'transcription', 'feedback', 'submitted_at']

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if obj.recorded_audio:
            if request:
                return request.build_absolute_uri(obj.recorded_audio.url)
            return f"http://127.0.0.1:8000{obj.recorded_audio.url}"
        return None


class SpokenEnglishTestRecordingSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    content_item_title = serializers.CharField(source='content_item.title', read_only=True)
    content_item_text = serializers.CharField(source='content_item.text_content', read_only=True)
    content_item_type = serializers.CharField(source='content_item.content_type', read_only=True)

    class Meta:
        model = SpokenEnglishTestRecording
        fields = [
            'id',
            'test_attempt',
            'content_item',
            'content_item_title',
            'content_item_text',
            'content_item_type',
            'recorded_audio',
            'audio_url',
            'teacher_score',
            'scored_at',
            'pronunciation_score',
            'clarity_score',
            'transcription',
            'feedback',
            'status',
            'created_at',
        ]
        read_only_fields = [
            'id', 
            'audio_url', 
            'content_item_title',
            'content_item_text',
            'content_item_type',
            'teacher_score', 
            'scored_at', 
            'pronunciation_score', 
            'clarity_score', 
            'transcription', 
            'feedback', 
            'status', 
            'created_at'
        ]

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if obj.recorded_audio:
            if request:
                return request.build_absolute_uri(obj.recorded_audio.url)
            return f"http://127.0.0.1:8000{obj.recorded_audio.url}"
        return None


class SpokenEnglishTestAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_mobile = serializers.CharField(source='student.mobile_number', read_only=True)
    module_title = serializers.CharField(source='test_module.title', read_only=True, default='')
    module_id = serializers.IntegerField(source='test_module_id', read_only=True)
    recordings_count = serializers.SerializerMethodField()
    scored_recordings_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishTestAttempt
        fields = [
            'id',
            'student',
            'student_name',
            'student_mobile',
            'module_id',
            'module_title',
            'content_type',
            'started_at',
            'submitted_at',
            'scored_at',
            'status',
            'total_items',
            'recorded_items',
            'recordings_count',
            'scored_recordings_count',
            'overall_score',
            'pronunciation_score',
            'clarity_score',
            'feedback',
        ]
        read_only_fields = ['id', 'started_at', 'submitted_at', 'scored_at', 'overall_score', 'pronunciation_score', 'clarity_score', 'feedback']

    def get_recordings_count(self, obj):
        return obj.recordings.count()

    def get_scored_recordings_count(self, obj):
        return obj.recordings.filter(teacher_score__isnull=False).count()


class SpokenEnglishTestAttemptDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_mobile = serializers.CharField(source='student.mobile_number', read_only=True)
    module_title = serializers.CharField(source='test_module.title', read_only=True, default='')
    module_id = serializers.IntegerField(source='test_module_id', read_only=True)
    recordings = SpokenEnglishTestRecordingSerializer(many=True, read_only=True)
    scored_recordings_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishTestAttempt
        fields = [
            'id',
            'student',
            'student_name',
            'student_mobile',
            'module_id',
            'module_title',
            'content_type',
            'started_at',
            'submitted_at',
            'scored_at',
            'status',
            'total_items',
            'recorded_items',
            'scored_recordings_count',
            'overall_score',
            'pronunciation_score',
            'clarity_score',
            'feedback',
            'recordings',
        ]
        read_only_fields = fields

    def get_scored_recordings_count(self, obj):
        return obj.recordings.filter(teacher_score__isnull=False).count()


# ==========================================
# Admin Serializers
# ==========================================

class AdminSpokenEnglishContentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    reference_audio_url = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = SpokenEnglishContent
        fields = [
            'id',
            'section_type',
            'content_type',
            'title',
            'text_content',
            'image',
            'image_url',
            'reference_audio',
            'reference_audio_url',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_reference_audio_url(self, obj):
        request = self.context.get('request')
        if obj.reference_audio:
            return request.build_absolute_uri(obj.reference_audio.url) if request else obj.reference_audio.url
        return None


class AdminSpokenEnglishPracticeScoreSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_mobile = serializers.CharField(source='student.mobile_number', read_only=True)
    content_title = serializers.CharField(source='content_item.title', read_only=True)
    content_type = serializers.CharField(source='content_item.content_type', read_only=True)
    section_type = serializers.CharField(source='content_item.section_type', read_only=True)
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishPracticeAttempt
        fields = [
            'id',
            'student_name',
            'student_mobile',
            'content_title',
            'content_type',
            'section_type',
            'audio_url',
            'status',
            'transcription',
            'feedback',
            'submitted_at',
        ]
        read_only_fields = fields

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if obj.recorded_audio:
            return request.build_absolute_uri(obj.recorded_audio.url) if request else obj.recorded_audio.url
        return None


# ==========================================
# Legacy Serializers (Preserved for compatibility)
# ==========================================

class TheorySectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheorySection
        fields = ['id', 'title', 'content', 'order']
        read_only_fields = fields


class SpokenEnglishQuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpokenEnglishQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']
        read_only_fields = fields


class SpokenEnglishTopicListSerializer(serializers.ModelSerializer):
    theory_count = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishTopic
        fields = [
            'id',
            'title',
            'description',
            'order',
            'theory_count',
            'questions_count',
            'is_active',
            'created_at'
        ]
        read_only_fields = fields

    def get_theory_count(self, obj):
        return obj.theory_sections.count()

    def get_questions_count(self, obj):
        return obj.questions.count()


class SpokenEnglishTopicDetailSerializer(serializers.ModelSerializer):
    theory_sections = TheorySectionSerializer(many=True, read_only=True)
    theory_count = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishTopic
        fields = [
            'id',
            'title',
            'description',
            'order',
            'is_active',
            'theory_count',
            'questions_count',
            'theory_sections',
            'created_at'
        ]
        read_only_fields = fields

    def get_theory_count(self, obj):
        return obj.theory_sections.count()

    def get_questions_count(self, obj):
        return obj.questions.count()


class SpokenEnglishAttemptSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_mobile = serializers.CharField(source='student.mobile_number', read_only=True)

    class Meta:
        model = SpokenEnglishAttempt
        fields = [
            'id',
            'student',
            'student_name',
            'student_mobile',
            'topic',
            'topic_title',
            'started_at',
            'submitted_at',
            'status',
            'total_questions',
            'attended_questions',
            'correct_answers',
            'incorrect_answers',
            'skipped_questions',
        ]
        read_only_fields = fields


class SpokenEnglishAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpokenEnglishAnswer
        fields = ['question', 'selected_option']


class SpokenEnglishResultSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    topic_description = serializers.CharField(source='topic.description', read_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishAttempt
        fields = [
            'id',
            'topic_title',
            'topic_description',
            'started_at',
            'submitted_at',
            'status',
            'total_questions',
            'attended_questions',
            'correct_answers',
            'incorrect_answers',
            'skipped_questions',
            'percentage',
        ]
        read_only_fields = fields

    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return round((obj.correct_answers / obj.total_questions) * 100, 1)
        return 0.0


class AdminTheoryInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    title = serializers.CharField(required=True, max_length=200)
    content = serializers.CharField(required=True)
    order = serializers.IntegerField(required=False, default=0)


class AdminQuestionInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    question_text = serializers.CharField(required=True)
    option_a = serializers.CharField(required=True, max_length=300)
    option_b = serializers.CharField(required=True, max_length=300)
    option_c = serializers.CharField(required=True, max_length=300)
    option_d = serializers.CharField(required=True, max_length=300)
    correct_option = serializers.ChoiceField(choices=['A', 'B', 'C', 'D'], required=True)
    order = serializers.IntegerField(required=False, default=0)


class AdminTopicCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    order = serializers.IntegerField(required=False, default=0)
    is_active = serializers.BooleanField(required=False, default=True)
    theory_sections = AdminTheoryInputSerializer(many=True, required=False, default=[])
    questions = AdminQuestionInputSerializer(many=True, required=False, default=[])

    def create(self, validated_data):
        theory_data = validated_data.pop('theory_sections', [])
        questions_data = validated_data.pop('questions', [])

        with transaction.atomic():
            topic = SpokenEnglishTopic.objects.create(**validated_data)

            for idx, sec in enumerate(theory_data, start=1):
                TheorySection.objects.create(
                    topic=topic,
                    title=sec['title'].strip(),
                    content=sec['content'].strip(),
                    order=sec.get('order') or idx
                )

            for idx, q in enumerate(questions_data, start=1):
                SpokenEnglishQuestion.objects.create(
                    topic=topic,
                    question_text=q['question_text'].strip(),
                    option_a=q['option_a'].strip(),
                    option_b=q['option_b'].strip(),
                    option_c=q['option_c'].strip(),
                    option_d=q['option_d'].strip(),
                    correct_option=q['correct_option'].strip().upper(),
                    order=q.get('order') or idx
                )

            return topic

    def update(self, instance, validated_data):
        theory_data = validated_data.pop('theory_sections', None)
        questions_data = validated_data.pop('questions', None)

        with transaction.atomic():
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()

            if theory_data is not None:
                instance.theory_sections.all().delete()
                for idx, sec in enumerate(theory_data, start=1):
                    TheorySection.objects.create(
                        topic=instance,
                        title=sec['title'].strip(),
                        content=sec['content'].strip(),
                        order=sec.get('order') or idx
                    )

            if questions_data is not None:
                instance.questions.all().delete()
                for idx, q in enumerate(questions_data, start=1):
                    SpokenEnglishQuestion.objects.create(
                        topic=instance,
                        question_text=q['question_text'].strip(),
                        option_a=q['option_a'].strip(),
                        option_b=q['option_b'].strip(),
                        option_c=q['option_c'].strip(),
                        option_d=q['option_d'].strip(),
                        correct_option=q['correct_option'].strip().upper(),
                        order=q.get('order') or idx
                    )

            return instance


class AdminSpokenScoreItemSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_mobile = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    standard = serializers.SerializerMethodField()
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    score_display = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishAttempt
        fields = [
            'id',
            'student_id',
            'student_name',
            'student_mobile',
            'standard',
            'topic_title',
            'status',
            'total_questions',
            'attended_questions',
            'correct_answers',
            'incorrect_answers',
            'skipped_questions',
            'score_display',
            'started_at',
            'submitted_at',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name or f"{obj.student.user.first_name} {obj.student.user.last_name}".strip() or obj.student.user.username
        return 'Unknown'

    def get_student_mobile(self, obj):
        if obj.student:
            return obj.student.mobile_number or obj.student.phone_number or ''
        return ''

    def get_student_id(self, obj):
        if obj.student:
            return obj.student.student_id or ''
        return ''

    def get_standard(self, obj):
        if obj.student:
            return obj.student.standard or '-'
        return '-'

    def get_score_display(self, obj):
        return f"{obj.correct_answers} / {obj.total_questions}"


