# ==========================================
# FILE: transactions/admin.py (UPDATE THIS FILE)
# ==========================================

from django.contrib import admin
from .models import Transaction, Category, Budget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'user', 'created_at']
    list_filter = ['user']
    search_fields = ['name']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['description', 'amount', 'transaction_type', 'category', 'date', 'user']
    list_filter = ['transaction_type', 'category', 'date', 'user']
    search_fields = ['description']
    date_hierarchy = 'date'

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['category', 'monthly_limit', 'month', 'year', 'user']
    list_filter = ['month', 'year', 'user']
    search_fields = ['category__name']