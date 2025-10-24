# ==========================================
# FILE: transactions/serializers.py (UPDATED THIS FILE)
# ==========================================

from rest_framework import serializers
from .models import Transaction, Category, Budget

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model
    """
    transaction_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'transaction_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_transaction_count(self, obj):
        """
        Count how many transactions use this category
        """
        return obj.transactions.count()
    
    def validate_color(self, value):
        """
        Validate hex color format (#RRGGBB)
        """
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("Color must be in hex format (#RRGGBB)")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'description', 'transaction_type', 'date',
            'category', 'category_name', 'category_color',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def validate_category(self, value):
        """
        Ensure category belongs to the user
        """
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Invalid category.")
        return value


class BudgetSerializer(serializers.ModelSerializer):
    """
    Serializer for Budget model
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    is_over_budget = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'monthly_limit',
            'month', 'year', 'spent_amount', 'remaining', 'is_over_budget',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_spent_amount(self, obj):
        return float(obj.get_spent_amount())
    
    def get_remaining(self, obj):
        return float(obj.get_remaining())
    
    def get_is_over_budget(self, obj):
        return obj.is_over_budget()
    
    def validate_month(self, value):
        if not 1 <= value <= 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value
    
    def validate_monthly_limit(self, value):
        if value <= 0:
            raise serializers.ValidationError("Monthly limit must be greater than zero.")
        return value
    
    def validate_category(self, value):
        """
        Ensure category belongs to the user
        """
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("Invalid category.")
        return value