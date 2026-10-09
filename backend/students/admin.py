from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_username', 'get_full_name', 'phone_number', 'abacus_level', 'created_at')
    list_filter = ('abacus_level', 'created_at')
    search_fields = ('student_id', 'phone_number', 'user__username', 'user__first_name', 'user__last_name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    fields = ('user', 'student_id', 'phone_number', 'abacus_level', 'created_at', 'updated_at')

    @admin.display(description='Username', ordering='user__username')
    def get_username(self, obj):
        return obj.user.username

    @admin.display(description='Full Name')
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or '-'
