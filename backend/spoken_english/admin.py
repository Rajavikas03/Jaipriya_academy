from django.contrib import admin
from .models import (
    SpokenEnglishTopic,
    TheorySection,
    SpokenEnglishQuestion,
    SpokenEnglishAttempt,
    SpokenEnglishAnswer,
)

class TheorySectionInline(admin.StackedInline):
    model = TheorySection
    extra = 1

class SpokenEnglishQuestionInline(admin.StackedInline):
    model = SpokenEnglishQuestion
    extra = 1

@admin.register(SpokenEnglishTopic)
class SpokenEnglishTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')
    inlines = [TheorySectionInline, SpokenEnglishQuestionInline]

class SpokenEnglishAnswerInline(admin.TabularInline):
    model = SpokenEnglishAnswer
    extra = 0
    readonly_fields = ('question', 'selected_option', 'answered_at')

@admin.register(SpokenEnglishAttempt)
class SpokenEnglishAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'topic', 'status', 'score_display', 'submitted_at')
    list_filter = ('status', 'topic')
    search_fields = ('student__full_name', 'student__mobile_number', 'topic__title')
    inlines = [SpokenEnglishAnswerInline]

    def score_display(self, obj):
        return f"{obj.correct_answers} / {obj.total_questions}"
    score_display.short_description = 'Score'

