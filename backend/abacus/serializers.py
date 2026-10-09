from rest_framework import serializers
from django.db import transaction
from .models import AbacusTest, AbacusQuestion, AbacusAttempt, AbacusAnswer
from students.models import ABACUS_LEVEL_CHOICES

class AbacusQuestionPublicSerializer(serializers.ModelSerializer):
    """
    Public question serializer: NEVER exposes correct_option to clients before or during tests.
    """
    class Meta:
        model = AbacusQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']
        read_only_fields = fields


class AbacusTestListSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    questions_count = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()

    class Meta:
        model = AbacusTest
        fields = ['id', 'title', 'level', 'level_display', 'duration_minutes', 'questions_count', 'attempts_count', 'is_active', 'created_at']
        read_only_fields = fields

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_attempts_count(self, obj):
        return obj.attempts.filter(status__in=['SUBMITTED', 'AUTO_SUBMITTED']).count()


class AbacusTestDetailSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    questions = AbacusQuestionPublicSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = AbacusTest
        fields = ['id', 'title', 'level', 'level_display', 'duration_minutes', 'questions_count', 'questions']
        read_only_fields = fields

    def get_questions_count(self, obj):
        return obj.questions.count()


class AbacusAnswerSaveSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(required=True)
    selected_option = serializers.ChoiceField(
        choices=['A', 'B', 'C', 'D', ''], 
        allow_blank=True, 
        allow_null=True, 
        required=False
    )


class AbacusAttemptDetailSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    level = serializers.CharField(source='test.level', read_only=True)
    level_display = serializers.CharField(source='test.get_level_display', read_only=True)
    duration_minutes = serializers.IntegerField(source='test.duration_minutes', read_only=True)
    remaining_seconds = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    questions = serializers.SerializerMethodField()
    saved_answers = serializers.SerializerMethodField()

    class Meta:
        model = AbacusAttempt
        fields = [
            'id', 
            'test_id', 
            'test_title', 
            'level', 
            'level_display', 
            'status', 
            'duration_minutes', 
            'remaining_seconds', 
            'is_expired', 
            'started_at', 
            'questions', 
            'saved_answers'
        ]
        read_only_fields = fields

    def get_questions(self, obj):
        questions = obj.test.questions.all()
        return AbacusQuestionPublicSerializer(questions, many=True).data

    def get_saved_answers(self, obj):
        return {str(a.question_id): a.selected_option for a in obj.answers.all()}


class AbacusResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    level = serializers.CharField(source='test.level', read_only=True)
    level_display = serializers.CharField(source='test.get_level_display', read_only=True)
    score_display = serializers.SerializerMethodField()

    class Meta:
        model = AbacusAttempt
        fields = [
            'id',
            'test_id',
            'test_title',
            'level',
            'level_display',
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

    def get_score_display(self, obj):
        return f"{obj.correct_answers} / {obj.total_questions}"


# ==========================================
# Admin Serializers for Upload & Test Scores
# ==========================================

class AdminQuestionInputSerializer(serializers.Serializer):
    question_text = serializers.CharField(required=True)
    option_a = serializers.CharField(required=True)
    option_b = serializers.CharField(required=True)
    option_c = serializers.CharField(required=True)
    option_d = serializers.CharField(required=True)
    correct_option = serializers.ChoiceField(choices=['A', 'B', 'C', 'D'], required=True)
    order = serializers.IntegerField(required=False, default=0)


class AdminTestCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=200)
    level = serializers.ChoiceField(choices=ABACUS_LEVEL_CHOICES, required=True)
    duration_minutes = serializers.IntegerField(required=False, default=10, min_value=1)
    is_active = serializers.BooleanField(required=False, default=True)
    questions = AdminQuestionInputSerializer(many=True, required=True)

    def validate_questions(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError('At least one question is required to publish a test.')
        return value

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        
        with transaction.atomic():
            test = AbacusTest.objects.create(**validated_data)
            
            for idx, q_data in enumerate(questions_data, start=1):
                order = q_data.get('order') or idx
                AbacusQuestion.objects.create(
                    test=test,
                    question_text=q_data['question_text'].strip(),
                    option_a=q_data['option_a'].strip(),
                    option_b=q_data['option_b'].strip(),
                    option_c=q_data['option_c'].strip(),
                    option_d=q_data['option_d'].strip(),
                    correct_option=q_data['correct_option'].strip().upper(),
                    order=order
                )
            
            return test


class AdminTestScoreItemSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_mobile = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    standard = serializers.SerializerMethodField()
    test_title = serializers.CharField(source='test.title', read_only=True)
    level_display = serializers.CharField(source='test.get_level_display', read_only=True)
    score_display = serializers.SerializerMethodField()

    class Meta:
        model = AbacusAttempt
        fields = [
            'id',
            'student_id',
            'student_name',
            'student_mobile',
            'standard',
            'test_title',
            'level_display',
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
