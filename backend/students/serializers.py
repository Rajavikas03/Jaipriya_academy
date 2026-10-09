from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import StudentProfile, ABACUS_LEVEL_CHOICES
import secrets

User = get_user_model()

def clean_mobile(val):
    if not val:
        return ''
    return str(val).strip().replace(' ', '').replace('-', '').replace('+', '')

class StudentAdminSerializer(serializers.ModelSerializer):
    abacus_level_display = serializers.CharField(source='get_abacus_level_display', read_only=True)
    student_id = serializers.CharField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'student_id',
            'full_name',
            'mobile_number',
            'standard',
            'date_of_birth',
            'abacus_level',
            'abacus_level_display',
            'gender',
            'parent_name',
            'parent_mobile',
            'school_name',
            'address',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'student_id', 'created_at', 'updated_at']

    def validate_mobile_number(self, value):
        cleaned = clean_mobile(value)
        if not cleaned or len(cleaned) < 7:
            raise serializers.ValidationError('Please enter a valid mobile number (at least 7 digits).')
        
        # Check uniqueness on creation or update
        instance = getattr(self, 'instance', None)
        qs = StudentProfile.objects.filter(mobile_number=cleaned)
        if instance:
            qs = qs.exclude(id=instance.id)
        if qs.exists():
            raise serializers.ValidationError('A student with this mobile number already exists.')
        return cleaned

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Full name is required.')
        return value.strip()

    def create(self, validated_data):
        mobile = validated_data['mobile_number']
        full_name = validated_data.get('full_name', '').strip()

        with transaction.atomic():
            # Create or find a User for this student
            username = mobile
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': full_name.split(' ')[0] if full_name else '',
                    'last_name': ' '.join(full_name.split(' ')[1:]) if ' ' in full_name else '',
                    'role': User.ROLE_STUDENT,
                }
            )
            if not created:
                user.first_name = full_name.split(' ')[0] if full_name else ''
                user.last_name = ' '.join(full_name.split(' ')[1:]) if ' ' in full_name else ''
                user.role = User.ROLE_STUDENT
                user.save()

            # Set an unguessable password for security since students login via mobile number
            user.set_password(secrets.token_urlsafe(32))
            user.save()

            # Create or update StudentProfile
            profile, _ = StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    **validated_data,
                    'phone_number': mobile
                }
            )

            return profile

    def update(self, instance, validated_data):
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if 'mobile_number' in validated_data:
                instance.phone_number = validated_data['mobile_number']
                if instance.user:
                    instance.user.username = validated_data['mobile_number']
                    instance.user.save()

            if 'full_name' in validated_data and instance.user:
                full_name = validated_data['full_name']
                instance.user.first_name = full_name.split(' ')[0] if full_name else ''
                instance.user.last_name = ' '.join(full_name.split(' ')[1:]) if ' ' in full_name else ''
                instance.user.save()

            instance.save()
            return instance

