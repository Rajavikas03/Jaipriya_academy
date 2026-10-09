from django.db import models
import os

def validate_pdf(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext != '.pdf':
        from django.core.exceptions import ValidationError
        raise ValidationError('Only PDF files are allowed.')

def validate_file_size(value):
    limit = 10 * 1024 * 1024  # 10 MB
    if value.size > limit:
        from django.core.exceptions import ValidationError
        raise ValidationError('File size must be under 10 MB.')


class Document(models.Model):
    title = models.CharField(max_length=200, help_text='Document title')
    file = models.FileField(
        upload_to='documents/',
        validators=[validate_pdf, validate_file_size],
        help_text='PDF file (max 10 MB)'
    )
    description = models.TextField(blank=True, default='', help_text='Optional description')
    is_active = models.BooleanField(default=True, help_text='Whether visible to students')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
