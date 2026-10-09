from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_STUDENT = 'STUDENT'
    ROLE_ACADEMY_ADMIN = 'ACADEMY_ADMIN'

    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_ACADEMY_ADMIN, 'Academy Admin'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        help_text='Designates the role of this user in the academy.'
    )

    email = models.EmailField(
        'email address',
        blank=True,
        null=True,
        help_text='Optional email address for the user.'
    )

    def is_student(self):
        return self.role == self.ROLE_STUDENT

    def is_academy_admin(self):
        return self.role == self.ROLE_ACADEMY_ADMIN or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
