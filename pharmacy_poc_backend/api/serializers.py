# api/serializers.py - UPDATED FOR UNIFIED USER SYSTEM

from rest_framework import serializers
from core.models import *

# ============================================================================
# BRANCH AND CONFIGURATION SERIALIZERS
# ============================================================================

class PharmacyBranchSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()
    staff_count = serializers.SerializerMethodField()
    customer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PharmacyBranch
        fields = '__all__'
    
    def get_user_count(self, obj):
        return obj.users.count()
    
    def get_staff_count(self, obj):
        return obj.users.filter(role__in=User.STAFF_ROLES).count()
    
    def get_customer_count(self, obj):
        return obj.users.filter(role__in=User.CUSTOMER_ROLES).count()

class BranchConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchConfiguration
        fields = '__all__'

# ============================================================================
# UNIFIED USER SYSTEM SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    is_staff_member = serializers.CharField(source='is_staff', read_only=True)
    is_customer_member = serializers.CharField(source='is_customer', read_only=True)
    can_validate = serializers.CharField(source='can_validate_prescription', read_only=True)
    
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def validate(self, data):
        """Custom validation based on role requirements"""
        role = data.get('role')
        
        if role in User.STAFF_ROLES:
            if not data.get('employee_id'):
                raise serializers.ValidationError("Staff members must have an employee_id")
            if not data.get('hire_date'):
                raise serializers.ValidationError("Staff members must have a hire_date")
        
        if role in User.CUSTOMER_ROLES:
            if not data.get('customer_id'):
                raise serializers.ValidationError("Customers must have a customer_id")
            if not data.get('date_of_birth'):
                raise serializers.ValidationError("Customers must have a date_of_birth")
        
        if role == 'pharmacist':
            if not data.get('license_number'):
                raise serializers.ValidationError("Pharmacists must have a license_number")
        
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_display_name', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'

class LoyaltyPointSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_display_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = LoyaltyPoint
        fields = '__all__'
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expiry_date < timezone.now().date()

# ============================================================================
# PRODUCT SERIALIZERS
# ============================================================================

class MedicineSerializer(serializers.ModelSerializer):
    current_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = '__all__'
    
    def get_current_stock(self, obj):
        branch_id = self.context.get('branch_id')
        if branch_id:
            try:
                inventory = InventoryRecord.objects.get(branch_id=branch_id, product=obj)
                return inventory.current_stock
            except InventoryRecord.DoesNotExist:
                return 0
        return None
    
    def get_is_low_stock(self, obj):
        branch_id = self.context.get('branch_id')
        if branch_id:
            try:
                inventory = InventoryRecord.objects.get(branch_id=branch_id, product=obj)
                return inventory.current_stock <= inventory.reorder_point
            except InventoryRecord.DoesNotExist:
                return False
        return None

class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionMedicine
        fields = '__all__'

class OverTheCounterMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OverTheCounterMedicine
        fields = '__all__'

class HealthSupplementSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthSupplement
        fields = '__all__'

class MedicalDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDevice
        fields = '__all__'

class MedicineDatabaseSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    
    class Meta:
        model = MedicineDatabase
        fields = '__all__'

# ============================================================================
# INVENTORY SERIALIZERS
# ============================================================================

class InventoryRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryRecord
        fields = '__all__'
    
    def get_is_low_stock(self, obj):
        return obj.current_stock <= obj.reorder_point
    
    def get_stock_status(self, obj):
        if obj.current_stock == 0:
            return 'out_of_stock'
        elif obj.current_stock <= obj.reorder_point:
            return 'low_stock'
        else:
            return 'in_stock'

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='inventory_record.product.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_display_name', read_only=True)
    performed_by_role = serializers.CharField(source='performed_by.role', read_only=True)
    
    class Meta:
        model = InventoryTransaction
        fields = '__all__'

# ============================================================================
# ORDER SYSTEM SERIALIZERS (UNIFIED ORDER MODEL)
# ============================================================================

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.get_display_name', read_only=True)
    customer_role = serializers.CharField(source='customer.role', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_display_name', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.get_display_name', read_only=True)
    served_by_name = serializers.CharField(source='served_by.get_display_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    # State Pattern information
    current_state_info = serializers.SerializerMethodField()
    available_transitions = serializers.SerializerMethodField()
    
    # Strategy Pattern information  
    calculated_total = serializers.SerializerMethodField()
    processing_strategy = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_current_state_info(self, obj):
        """Get current state information using State Pattern"""
        state = obj.get_state_handler()
        if state:
            return {
                'current_status': obj.status,
                'allowed_actions': state.get_allowed_actions(obj)
            }
        return None
    
    def get_available_transitions(self, obj):
        """Get available status transitions using State Pattern"""
        state = obj.get_state_handler()
        if state:
            possible_statuses = ['pending', 'processing', 'completed', 'cancelled']
            return [status for status in possible_statuses 
                   if state.can_transition_to(status)]
        return []
    
    def get_calculated_total(self, obj):
        """Get calculated total using Strategy Pattern"""
        try:
            return obj.calculate_total_with_strategy()
        except:
            return obj.total_amount
    
    def get_processing_strategy(self, obj):
        """Get processing strategy information"""
        strategy = obj.get_processing_strategy()
        if strategy:
            return {
                'strategy_type': strategy.__class__.__name__,
                'order_type': obj.order_type,
                'requires_validation': obj.order_type == 'prescription',
                'requires_delivery': obj.order_type == 'online'
            }
        return None

# ============================================================================
# PRESCRIPTION SYSTEM SERIALIZERS
# ============================================================================

class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_code = serializers.CharField(source='medicine.product_code', read_only=True)
    remaining_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionItem
        fields = '__all__'
    
    def get_remaining_quantity(self, obj):
        return obj.quantity_prescribed - obj.quantity_dispensed

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)
    submitted_by_name = serializers.CharField(source='submitted_by.get_display_name', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.get_display_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = '__all__'
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.expiry_date < timezone.now().date()
    
    def get_total_items(self, obj):
        return obj.items.count()

# ============================================================================
# DELIVERY SYSTEM SERIALIZERS (UNIFIED DELIVERY MODEL)
# ============================================================================

class DeliverySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.get_display_name', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.get_display_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    delivery_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Delivery
        fields = '__all__'
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.scheduled_date and obj.status not in ['delivered', 'cancelled']:
            return obj.scheduled_date < timezone.now()
        return False
    
    def get_delivery_type_display(self, obj):
        return {
            'type': obj.delivery_type,
            'is_pickup': obj.is_pickup_delivery(),
            'is_home_delivery': obj.is_home_delivery(),
            'fee': obj.delivery_fee if obj.is_home_delivery() else 0
        }

# ============================================================================
# FACTORY AND REPORT SERIALIZERS
# ============================================================================

class ProductFactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFactory
        fields = '__all__'

class ReportGeneratorSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_display_name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    report_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportGenerator
        fields = '__all__'
    
    def get_report_summary(self, obj):
        """Get summary information from report data"""
        data = obj.report_data
        if obj.report_type == 'sales':
            return {
                'total_orders': data.get('total_orders', 0),
                'total_revenue': data.get('total_revenue', 0),
                'period': data.get('period', 'N/A')
            }
        elif obj.report_type == 'inventory':
            return {
                'total_products': data.get('total_products', 0),
                'low_stock_items': data.get('low_stock_items', 0),
                'total_value': data.get('total_stock_value', 0)
            }
        elif obj.report_type == 'staff_performance':
            return {
                'total_staff': data.get('total_staff', 0),
                'period': data.get('period', 'N/A')
            }
        return data