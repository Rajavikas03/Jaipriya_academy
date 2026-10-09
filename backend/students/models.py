from django.db import models
from django.conf import settings
import random

def generate_student_id():
    """Generates a default unique student ID format: JPA-2026-XXXX"""
    random_digits = random.randint(1000, 9999)
    return f"JPA-2026-{random_digits}"

ABACUS_LEVEL_CHOICES = [
    ('JUNIOR', 'Junior'),
    ('LEVEL_1', 'Level 1'),
    ('LEVEL_2', 'Level 2'),
    ('LEVEL_3', 'Level 3'),
    ('LEVEL_4', 'Level 4'),
    ('LEVEL_5', 'Level 5'),
    ('LEVEL_6', 'Level 6'),
    ('LEVEL_7', 'Level 7'),
    ('LEVEL_8', 'Level 8'),
]

GENDER_CHOICES = [
    ('MALE', 'Male'),
    ('FEMALE', 'Female'),
    ('OTHER', 'Other'),
]

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    student_id = models.CharField(
        max_length=32,
        unique=True,
        blank=True,
        null=True,
        help_text='Unique academy student identification number.'
    )
    full_name = models.CharField(
        max_length=150,
        blank=True,
        help_text='Full name of the student.'
    )
    mobile_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text='Registered student/parent mobile number used for student login.'
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='Legacy/alternate phone number field for backward compatibility.'
    )
    standard = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Current school grade / class (e.g. Class 3, 4th Standard, UKG).'
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text='Date of birth of the student.'
    )
    abacus_level = models.CharField(
        max_length=20,
        choices=ABACUS_LEVEL_CHOICES,
        default='JUNIOR',
        help_text='Assigned Abacus learning level (Junior through Level 8).'
    )
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )
    parent_name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text='Parent or Guardian full name.'
    )
    parent_mobile = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='Alternate parent contact mobile number.'
    )
    school_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text='Name of the school currently attending.'
    )
    address = models.TextField(
        blank=True,
        null=True,
        help_text='Residential address.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.student_id:
            new_id = generate_student_id()
            while StudentProfile.objects.filter(student_id=new_id).exists():
                new_id = generate_student_id()
            self.student_id = new_id
        
        # Keep mobile_number and phone_number in sync if one is provided
        if self.mobile_number and not self.phone_number:
            self.phone_number = self.mobile_number
        elif self.phone_number and not self.mobile_number:
            self.mobile_number = self.phone_number

        # Sync full_name with user object if blank
        if not self.full_name and self.user:
            name = f"{self.user.first_name} {self.user.last_name}".strip()
            self.full_name = name or self.user.username
        
        super().save(*args, **kwargs)

    def __str__(self):
        name = self.full_name or self.user.username
        level = self.get_abacus_level_display() if self.abacus_level else 'No Level'
        mobile = self.mobile_number or self.phone_number or 'No Mobile'
        return f"{name} ({mobile} | {level})"
