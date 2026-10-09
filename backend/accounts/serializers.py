from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from students.models import StudentProfile

User = get_user_model()

def clean_mobile(val):
    if not val:
        return ''
    return str(val).strip().replace(' ', '').replace('-', '').replace('+', '')

class UserMeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    standard = serializers.SerializerMethodField()
    date_of_birth = serializers.SerializerMethodField()
    abacus_level = serializers.SerializerMethodField()
    abacus_level_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'full_name',
            'role', 
            'mobile_number',
            'student_id', 
            'standard',
            'date_of_birth',
            'abacus_level', 
            'abacus_level_display'
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile.full_name:
                return obj.student_profile.full_name
        except Exception:
            pass
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username

    def get_mobile_number(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile:
                return obj.student_profile.mobile_number or obj.student_profile.phone_number
        except Exception:
            pass
        return None

    def get_student_id(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile:
                return obj.student_profile.student_id
        except Exception:
            pass
        return None

    def get_standard(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile:
                return obj.student_profile.standard
        except Exception:
            pass
        return None

    def get_date_of_birth(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile and obj.student_profile.date_of_birth:
                return str(obj.student_profile.date_of_birth)
        except Exception:
            pass
        return None

    def get_abacus_level(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile:
                return obj.student_profile.abacus_level
        except Exception:
            pass
        return None

    def get_abacus_level_display(self, obj):
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile and obj.student_profile.abacus_level:
                return obj.student_profile.get_abacus_level_display()
        except Exception:
            pass
        return None


class StudentLoginSerializer(serializers.Serializer):
    """
    Passwordless Student Login: Requires ONLY mobile number.
    """
    mobile_number = serializers.CharField(required=True, max_length=20)

    def validate(self, attrs):
        raw_mobile = attrs.get('mobile_number', '').strip()
        mobile = clean_mobile(raw_mobile)

        if not mobile:
            raise serializers.ValidationError({'mobile_number': 'Please enter a valid mobile number.'})

        # Find student profile with this mobile number
        profile = StudentProfile.objects.filter(
            Q(mobile_number=mobile) | 
            Q(mobile_number=raw_mobile) |
            Q(phone_number=mobile) |
            Q(phone_number=raw_mobile) |
            Q(user__username=mobile) |
            Q(user__username=raw_mobile)
        ).select_related('user').first()

        if not profile or not profile.user:
            raise serializers.ValidationError({
                'detail': 'Your account has not been added yet. Please contact JaiPriya Academy.'
            })

        user = profile.user
        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This student account is currently inactive. Please contact the academy.'
            })

        refresh = RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserMeSerializer(user).data
        }


class AdminLoginSerializer(serializers.Serializer):
    """
    Admin Login: Requires mobile number and password.
    """
    mobile_number = serializers.CharField(required=True, max_length=50)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        raw_mobile = attrs.get('mobile_number', '').strip()
        mobile = clean_mobile(raw_mobile)
        password = attrs.get('password', '')

        if not raw_mobile or not password:
            raise serializers.ValidationError({'detail': 'Please enter both your mobile number and password.'})

        # Find user matching mobile number, phone, or username with admin role
        user = User.objects.filter(
            Q(role=User.ROLE_ACADEMY_ADMIN) | Q(is_superuser=True)
        ).filter(
            Q(username=raw_mobile) |
            Q(username=mobile) |
            Q(student_profile__mobile_number=mobile) |
            Q(student_profile__mobile_number=raw_mobile) |
            Q(student_profile__phone_number=mobile) |
            Q(student_profile__phone_number=raw_mobile)
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                'detail': 'Invalid admin credentials. Please check your mobile number and password.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This administrator account is disabled.'
            })

        refresh = RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserMeSerializer(user).data
        }
