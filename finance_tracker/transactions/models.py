# ==========================================
# FILE: transactions/models.py (UPDATED THIS FILE)
# ==========================================
# Add Category and Budget models, update Transaction model

from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    """
    Categories for organizing transactions (e.g., Food, Transport, Entertainment)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        # Ensure user can't create duplicate category names
        unique_together = ['user', 'name']
    
    def __str__(self):
        return self.name


class Transaction(models.Model):
    """
    Represents a single financial transaction (income or expense)
    """
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=7, choices=TRANSACTION_TYPES)
    date = models.DateField()
    
    # NEW: Link transaction to a category (optional)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,  # If category deleted, keep transaction but set category to null
        related_name='transactions',
        null=True,  # Category is optional
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.transaction_type}: ${self.amount} - {self.description}"


class Budget(models.Model):
    """
    Monthly budget limits for specific categories
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Month and year for the budget
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()   # e.g., 2025
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', '-month']
        # Ensure one budget per category per month
        unique_together = ['user', 'category', 'month', 'year']
    
    def __str__(self):
        return f"{self.category.name} - {self.month}/{self.year}: ${self.monthly_limit}"
    
    def get_spent_amount(self):
        """
        Calculate how much has been spent in this category for this month/year
        """
        from django.db.models import Sum
        spent = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            transaction_type='expense',
            date__month=self.month,
            date__year=self.year
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        return spent
    
    def get_remaining(self):
        """
        Calculate remaining budget
        """
        return self.monthly_limit - self.get_spent_amount()
    
    def is_over_budget(self):
        """
        Check if budget is exceeded
        """
        return self.get_spent_amount() > self.monthly_limit
