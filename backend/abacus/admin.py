from django.contrib import admin
from .models import AbacusTest, AbacusQuestion, AbacusAttempt, AbacusAnswer

class AbacusQuestionInline(admin.TabularInline):
    model = AbacusQuestion
    extra = 3
    fields = ('order', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option')

@admin.register(AbacusTest)
class AbacusTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'duration_minutes', 'is_active', 'get_question_count', 'created_at')
    list_filter = ('level', 'is_active', 'created_at')
    search_fields = ('title',)
    inlines = [AbacusQuestionInline]

    @admin.display(description='Total Questions')
    def get_question_count(self, obj):
        return obj.questions.count()

@admin.register(AbacusQuestion)
class AbacusQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'test', 'order', 'question_text', 'correct_option')
    list_filter = ('test__level', 'test')
    search_fields = ('question_text', 'test__title')

@admin.register(AbacusAttempt)
class AbacusAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'get_student_username', 
        'test', 
        'status', 
        'correct_answers', 
        'total_questions', 
        'started_at', 
        'submitted_at'
    )
    list_filter = ('status', 'test__level', 'started_at')
    search_fields = ('student__user__username', 'test__title')
    readonly_fields = (
        'started_at', 
        'submitted_at', 
        'total_questions', 
        'attended_questions', 
        'correct_answers', 
        'incorrect_answers', 
        'skipped_questions'
    )

    @admin.display(description='Student', ordering='student__user__username')
    def get_student_username(self, obj):
        return obj.student.user.username

@admin.register(AbacusAnswer)
class AbacusAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question', 'selected_option', 'answered_at')
    list_filter = ('attempt__test', 'selected_option')

