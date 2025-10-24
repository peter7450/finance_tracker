from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime
from .models import Transaction, Category, Budget
from .serializers import TransactionSerializer, CategorySerializer, BudgetSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoints for categories:
    - GET /api/categories/ - List all categories
    - POST /api/categories/ - Create new category
    - GET /api/categories/{id}/ - Get single category
    - PUT /api/categories/{id}/ - Update category
    - DELETE /api/categories/{id}/ - Delete category
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoints for budgets:
    - GET /api/budgets/ - List all budgets
    - POST /api/budgets/ - Create new budget
    - GET /api/budgets/{id}/ - Get single budget
    - PUT /api/budgets/{id}/ - Update budget
    - DELETE /api/budgets/{id}/ - Delete budget
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """
        Custom endpoint: GET /api/budgets/current_month/
        Returns budgets for the current month
        """
        now = datetime.now()
        budgets = self.get_queryset().filter(month=now.month, year=now.year)
        serializer = self.get_serializer(budgets, many=True)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for transactions (updated)
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Enhanced summary with category breakdown
        """
        transactions = self.get_queryset()
        
        total_income = transactions.filter(
            transaction_type='income'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        total_expenses = transactions.filter(
            transaction_type='expense'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Category breakdown for expenses
        category_breakdown = transactions.filter(
            transaction_type='expense'
        ).values('category__name', 'category__color').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'balance': float(total_income - total_expenses),
            'transaction_count': transactions.count(),
            'category_breakdown': list(category_breakdown)
        })
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Custom endpoint: GET /api/transactions/by_category/
        Returns transactions grouped by category
        """
        category_id = request.query_params.get('category_id')
        if category_id:
            transactions = self.get_queryset().filter(category_id=category_id)
        else:
            transactions = self.get_queryset()
        
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)
