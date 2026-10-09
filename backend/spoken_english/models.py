from django.db import models
from django.utils import timezone
from students.models import StudentProfile


class SpokenEnglishModule(models.Model):
    """
    Modules / Sets for Spoken English (Theory, Practice, Test).
    Contains multiple SpokenEnglishContent items in strict sequence order.
    """
    SECTION_THEORY = 'THEORY'
    SECTION_PRACTICE = 'PRACTICE'
    SECTION_TEST = 'TEST'

    SECTION_CHOICES = [
        (SECTION_THEORY, 'Theory (Read + Listen)'),
        (SECTION_PRACTICE, 'Practice (Read + Listen + Record)'),
        (SECTION_TEST, 'Test (Read + Record + Evaluate)'),
    ]

    title = models.CharField(
        max_length=200,
        help_text='Title or name of the module / set'
    )
    description = models.TextField(
        blank=True,
        default='',
        help_text='Optional description of the module'
    )
    section_type = models.CharField(
        max_length=20,
        choices=SECTION_CHOICES,
        default=SECTION_THEORY,
        help_text='Learning section: Theory, Practice, or Test'
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Display sequence of module'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Published status: only active modules are visible to students'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['section_type', 'order', 'id']

    @property
    def items_count(self):
        return self.items.filter(is_active=True).count()

    @property
    def active_items(self):
        return self.items.filter(is_active=True).order_by('order', 'id')

    def __str__(self):
        return f"[{self.get_section_type_display()}] {self.title}"


class SpokenEnglishContent(models.Model):
    """
    Unified Spoken English Content covering:
    - Section: THEORY (Read + Listen), PRACTICE (Read + Listen + Record), TEST (Read + Record + Evaluate)
    - Content Type: WORD, SENTENCE, PARAGRAPH
    - Optional Module/Set parent
    """
    SECTION_THEORY = 'THEORY'
    SECTION_PRACTICE = 'PRACTICE'
    SECTION_TEST = 'TEST'

    SECTION_CHOICES = [
        (SECTION_THEORY, 'Theory (Read + Listen)'),
        (SECTION_PRACTICE, 'Practice (Read + Listen + Record)'),
        (SECTION_TEST, 'Test (Read + Record + Evaluate)'),
    ]

    TYPE_WORD = 'WORD'
    TYPE_SENTENCE = 'SENTENCE'
    TYPE_PARAGRAPH = 'PARAGRAPH'

    CONTENT_TYPE_CHOICES = [
        (TYPE_WORD, 'Word'),
        (TYPE_SENTENCE, 'Sentence'),
        (TYPE_PARAGRAPH, 'Paragraph'),
    ]

    module = models.ForeignKey(
        SpokenEnglishModule,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='Parent module / set for this item'
    )
    section_type = models.CharField(
        max_length=20,
        choices=SECTION_CHOICES,
        default=SECTION_THEORY,
        help_text='Learning section: Theory, Practice, or Test'
    )
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        default=TYPE_WORD,
        help_text='Content type: Word, Sentence, or Paragraph'
    )
    title = models.CharField(
        max_length=200,
        help_text='Title or description of the content item'
    )
    text_content = models.TextField(
        help_text='The word, sentence, or paragraph text for reading/speaking'
    )
    image = models.FileField(
        upload_to='spoken_english/images/',
        blank=True,
        null=True,
        help_text='Optional illustration image'
    )
    reference_audio = models.FileField(
        upload_to='spoken_english/audio/',
        blank=True,
        null=True,
        help_text='Reference human audio pronunciation (used in Theory and Practice)'
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Display order'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Published status: only active items are visible to students'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['section_type', 'content_type', 'order', 'id']

    def __str__(self):
        return f"[{self.get_section_type_display()} - {self.get_content_type_display()}] {self.title}"


class SpokenEnglishPracticeAttempt(models.Model):
    """
    Records student self-practice recordings (Read + Listen + Record mode).
    """
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='spoken_practice_attempts'
    )
    content_item = models.ForeignKey(
        SpokenEnglishContent,
        on_delete=models.CASCADE,
        related_name='practice_attempts'
    )
    recorded_audio = models.FileField(
        upload_to='spoken_english/practice_recordings/',
        help_text='Student voice recording file'
    )
    status = models.CharField(
        max_length=30,
        default='RECORDED'
    )
    transcription = models.TextField(
        blank=True,
        default='',
        help_text='Recognized speech transcription if processed'
    )
    feedback = models.TextField(
        blank=True,
        default='Practice recording saved successfully.'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Practice: {self.student.full_name or self.student.user.username} - {self.content_item.title}"


class SpokenEnglishTestAttempt(models.Model):
    """
    Independent Spoken English Assessment (Read + Record + Evaluate mode).
    Can be tied directly to a specific Test Module.
    """
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_SUBMITTED = 'SUBMITTED'
    STATUS_UNDER_REVIEW = 'UNDER_REVIEW'
    STATUS_PARTIALLY_SCORED = 'PARTIALLY_SCORED'
    STATUS_SCORED = 'SCORED'
    STATUS_PENDING_EVALUATION = 'PENDING_EVALUATION'  # Kept for backward compatibility
    STATUS_EVALUATED = 'EVALUATED'                    # Kept for backward compatibility

    STATUS_CHOICES = [
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_UNDER_REVIEW, 'Under Review'),
        (STATUS_PARTIALLY_SCORED, 'Partially Scored'),
        (STATUS_SCORED, 'Scored'),
        (STATUS_PENDING_EVALUATION, 'Pending Evaluation'),
        (STATUS_EVALUATED, 'Evaluated'),
    ]

    CONTENT_FILTER_CHOICES = [
        ('ALL', 'All Content'),
        ('WORD', 'Words'),
        ('SENTENCE', 'Sentences'),
        ('PARAGRAPH', 'Paragraphs'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='spoken_test_attempts'
    )
    test_module = models.ForeignKey(
        SpokenEnglishModule,
        on_delete=models.CASCADE,
        related_name='test_attempts',
        help_text='Associated test module / set'
    )
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_FILTER_CHOICES,
        default='ALL'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    scored_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_IN_PROGRESS
    )
    total_items = models.PositiveIntegerField(default=0)
    recorded_items = models.PositiveIntegerField(default=0)
    overall_score = models.FloatField(
        null=True,
        blank=True,
        help_text='Teacher evaluated overall score percentage (0 to 100)'
    )
    pronunciation_score = models.FloatField(null=True, blank=True)
    clarity_score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(
        blank=True,
        default=''
    )

    class Meta:
        ordering = ['-started_at']

    def calculate_overall_score(self):
        """
        Calculates the official overall score from all teacher-assigned question scores.
        Overall score = Sum of all question scores ÷ Total required questions.
        Only marks as SCORED when all required questions are scored.
        """
        recordings = list(self.recordings.all())
        if self.test_module and self.total_items == 0:
            self.total_items = self.test_module.items.filter(is_active=True).count()
        total = self.total_items if self.total_items > 0 else len(recordings)
        scored_recordings = [r for r in recordings if r.teacher_score is not None]

        if total > 0 and len(scored_recordings) >= total:
            sum_scores = sum(r.teacher_score for r in scored_recordings)
            self.overall_score = round(sum_scores / total, 1)
            self.status = self.STATUS_SCORED
            self.scored_at = timezone.now()
        elif len(scored_recordings) > 0:
            self.status = self.STATUS_PARTIALLY_SCORED
            self.overall_score = None
            self.scored_at = None
        else:
            self.status = self.STATUS_SUBMITTED
            self.overall_score = None
            self.scored_at = None

        self.save()
        return self

    def __str__(self):
        module_name = f" - {self.test_module.title}" if self.test_module else ""
        return f"Test Attempt {self.id}{module_name}: {self.student.full_name or self.student.user.username} ({self.status})"


class SpokenEnglishTestRecording(models.Model):
    """
    Individual voice recording for a specific test item within a test attempt.
    """
    test_attempt = models.ForeignKey(
        SpokenEnglishTestAttempt,
        on_delete=models.CASCADE,
        related_name='recordings'
    )
    content_item = models.ForeignKey(
        SpokenEnglishContent,
        on_delete=models.CASCADE,
        related_name='test_recordings'
    )
    recorded_audio = models.FileField(
        upload_to='spoken_english/test_recordings/'
    )
    teacher_score = models.FloatField(
        null=True,
        blank=True,
        help_text='Teacher manual score from 0 to 100'
    )
    scored_at = models.DateTimeField(null=True, blank=True)
    pronunciation_score = models.FloatField(null=True, blank=True)
    clarity_score = models.FloatField(null=True, blank=True)
    transcription = models.TextField(blank=True, default='')
    feedback = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=30,
        default='RECORDED'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        score_str = f"Score: {self.teacher_score}" if self.teacher_score is not None else "Unscored"
        return f"Attempt {self.test_attempt_id} - Item {self.content_item_id}: {score_str}"


# Legacy models preserved for backward compatibility
class SpokenEnglishTopic(models.Model):
    title = models.CharField(
        max_length=200,
        help_text='Topic Title (e.g. Basic Grammar, Sentence Formation).'
    )
    description = models.TextField(
        blank=True,
        help_text='Brief explanation of what the student will learn in this topic.'
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Display order of topics.'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Published status: only active topics are visible to students.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        status = "Published" if self.is_active else "Draft"
        return f"{self.title} ({status})"


class TheorySection(models.Model):
    topic = models.ForeignKey(
        SpokenEnglishTopic,
        on_delete=models.CASCADE,
        related_name='theory_sections'
    )
    title = models.CharField(
        max_length=200,
        help_text='Section Title (e.g. What is a Sentence?, Subject and Predicate).'
    )
    content = models.TextField(
        help_text='Formatted educational text/markdown explaining the concept.'
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Reading order of this theory section within the topic.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.topic.title} - Section {self.order}: {self.title}"


class SpokenEnglishQuestion(models.Model):
    topic = models.ForeignKey(
        SpokenEnglishTopic,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField(
        help_text='The MCQ question prompt or challenge.'
    )
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        help_text='The correct MCQ option (A, B, C, or D).'
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Display sequence of question.'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order} ({self.topic.title}): {self.question_text[:50]}"


class SpokenEnglishAttempt(models.Model):
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_SUBMITTED = 'SUBMITTED'

    STATUS_CHOICES = [
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_SUBMITTED, 'Submitted'),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='spoken_english_attempts'
    )
    topic = models.ForeignKey(
        SpokenEnglishTopic,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_IN_PROGRESS
    )

    total_questions = models.PositiveIntegerField(default=0)
    attended_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)
    skipped_questions = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def evaluate(self):
        all_questions = list(self.topic.questions.all())
        total = len(all_questions)

        answers_map = {
            a.question_id: a.selected_option
            for a in self.answers.all()
            if a.selected_option
        }

        attended = len(answers_map)
        correct = 0
        incorrect = 0

        for q in all_questions:
            selected = answers_map.get(q.id)
            if selected:
                if selected.upper() == q.correct_option.upper():
                    correct += 1
                else:
                    incorrect += 1

        skipped = total - attended

        self.total_questions = total
        self.attended_questions = attended
        self.correct_answers = correct
        self.incorrect_answers = incorrect
        self.skipped_questions = skipped
        self.status = self.STATUS_SUBMITTED
        self.submitted_at = timezone.now()
        self.save()

        return self

    def __str__(self):
        return f"{self.student.full_name or self.student.user.username} - {self.topic.title} ({self.status})"


class SpokenEnglishAnswer(models.Model):
    attempt = models.ForeignKey(
        SpokenEnglishAttempt,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        SpokenEnglishQuestion,
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    selected_option = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        blank=True,
        null=True
    )
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Attempt {self.attempt_id} - Q{self.question_id}: {self.selected_option or 'Skipped'}"


