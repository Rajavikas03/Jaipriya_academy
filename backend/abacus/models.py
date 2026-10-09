from django.db import models
from django.utils import timezone
from datetime import timedelta
from students.models import StudentProfile, ABACUS_LEVEL_CHOICES

class AbacusTest(models.Model):
    title = models.CharField(max_length=200, help_text="Title of the test e.g. 'Speed Math Challenge 1'")
    level = models.CharField(
        max_length=20, 
        choices=ABACUS_LEVEL_CHOICES,
        help_text="Abacus level this test is assigned to."
    )
    duration_minutes = models.PositiveIntegerField(
        default=10, 
        help_text="Test duration in minutes (default is 10 minutes)."
    )
    is_active = models.BooleanField(
        default=True, 
        help_text="Whether this test is currently open to students."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level', 'title']

    def __str__(self):
        return f"{self.title} ({self.get_level_display()})"


class AbacusQuestion(models.Model):
    OPTION_CHOICES = [
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ]

    test = models.ForeignKey(
        AbacusTest, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_text = models.TextField(help_text="MCQ question text, calculation problem, or prompt.")
    option_a = models.CharField(max_length=255, help_text="Answer option A")
    option_b = models.CharField(max_length=255, help_text="Answer option B")
    option_c = models.CharField(max_length=255, help_text="Answer option C")
    option_d = models.CharField(max_length=255, help_text="Answer option D")
    correct_option = models.CharField(
        max_length=1, 
        choices=OPTION_CHOICES, 
        help_text="Correct answer option (A, B, C, or D)"
    )
    order = models.PositiveIntegerField(default=0, help_text="Display order sequence.")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order or self.id}: {self.question_text[:50]} ({self.test.title})"


class AbacusAttempt(models.Model):
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_SUBMITTED = 'SUBMITTED'
    STATUS_AUTO_SUBMITTED = 'AUTO_SUBMITTED'

    STATUS_CHOICES = [
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_AUTO_SUBMITTED, 'Auto Submitted (Time Expired)'),
    ]

    student = models.ForeignKey(
        StudentProfile, 
        on_delete=models.CASCADE, 
        related_name='abacus_attempts'
    )
    test = models.ForeignKey(
        AbacusTest, 
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

    @property
    def expires_at(self):
        return self.started_at + timedelta(minutes=self.test.duration_minutes)

    @property
    def remaining_seconds(self):
        if self.status != self.STATUS_IN_PROGRESS:
            return 0
        now = timezone.now()
        remaining = int((self.expires_at - now).total_seconds())
        return max(0, remaining)

    @property
    def is_expired(self):
        if self.status != self.STATUS_IN_PROGRESS:
            return True
        return timezone.now() >= self.expires_at

    def evaluate(self, auto=False):
        """
        Calculates score and evaluation metrics on the server safely.
        """
        questions = self.test.questions.all()
        total = questions.count()
        attended = 0
        correct = 0
        incorrect = 0

        # Build a map of saved answers
        saved_answers = {a.question_id: a.selected_option for a in self.answers.all()}

        for q in questions:
            selected = saved_answers.get(q.id)
            if selected and selected.strip():
                attended += 1
                if selected.strip().upper() == q.correct_option.strip().upper():
                    correct += 1
                else:
                    incorrect += 1

        self.total_questions = total
        self.attended_questions = attended
        self.correct_answers = correct
        self.incorrect_answers = incorrect
        self.skipped_questions = max(0, total - attended)
        self.submitted_at = timezone.now()
        self.status = self.STATUS_AUTO_SUBMITTED if auto else self.STATUS_SUBMITTED
        self.save()

    def __str__(self):
        return f"{self.student.user.username} - {self.test.title} ({self.status})"


class AbacusAnswer(models.Model):
    attempt = models.ForeignKey(
        AbacusAttempt, 
        on_delete=models.CASCADE, 
        related_name='answers'
    )
    question = models.ForeignKey(
        AbacusQuestion, 
        on_delete=models.CASCADE, 
        related_name='student_answers'
    )
    selected_option = models.CharField(
        max_length=1, 
        choices=AbacusQuestion.OPTION_CHOICES, 
        null=True, 
        blank=True
    )
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Attempt {self.attempt_id} - Q{self.question_id}: {self.selected_option or 'Skipped'}"

