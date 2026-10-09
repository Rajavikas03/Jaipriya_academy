from rest_framework import serializers
from .models import SpokenEnglishModule, SpokenEnglishContent
from .serializers import SpokenEnglishTheoryContentSerializer, AdminSpokenEnglishContentSerializer


class SpokenEnglishModuleListSerializer(serializers.ModelSerializer):
    """Public list serializer — shows batch summary without full items."""
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishModule
        fields = [
            'id', 'title', 'description', 'section_type', 'order', 'is_active',
            'created_at', 'updated_at', 'items_count'
        ]
        read_only_fields = fields

    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class SpokenEnglishModulePublicSerializer(serializers.ModelSerializer):
    """Public detail serializer — includes all active items."""
    items = SpokenEnglishTheoryContentSerializer(many=True, read_only=True, source='active_items')
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishModule
        fields = [
            'id', 'title', 'description', 'section_type', 'order', 'is_active',
            'created_at', 'updated_at', 'items', 'items_count'
        ]
        read_only_fields = fields

    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class AdminSpokenEnglishModuleListSerializer(serializers.ModelSerializer):
    """Admin list serializer — shows batch summary."""
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = SpokenEnglishModule
        fields = [
            'id', 'title', 'description', 'section_type', 'order', 'is_active',
            'created_at', 'updated_at', 'items_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'items_count']

    def get_items_count(self, obj):
        return obj.items.count()


class AdminSpokenEnglishModuleDetailSerializer(serializers.ModelSerializer):
    """Admin detail serializer — includes all items."""
    items = AdminSpokenEnglishContentSerializer(many=True, read_only=True)

    class Meta:
        model = SpokenEnglishModule
        fields = [
            'id', 'title', 'description', 'section_type', 'order', 'is_active',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminSpokenEnglishModuleCreateSerializer(serializers.ModelSerializer):
    """Admin create serializer — creates a batch (items added separately)."""
    class Meta:
        model = SpokenEnglishModule
        fields = [
            'id', 'title', 'description', 'section_type', 'order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
