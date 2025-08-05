# core/models.py - REFACTORED WITH UNIFIED USER SYSTEM

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

# ============================================================================
# 1. PharmacyBranch and Related Classes
# ============================================================================

class PharmacyBranch(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class BranchConfiguration(models.Model):
    branch = models.OneToOneField(PharmacyBranch, on_delete=models.CASCADE, related_name='configuration')
    max_prescriptions_per_day = models.PositiveIntegerField(default=100)
    operating_hours = models.JSONField(default=dict)
    emergency_contact = models.CharField(max_length=20)

# ============================================================================
# 2. UNIFIED USER SYSTEM - RBAC (Role-Based Access Control)
# ============================================================================

class User(models.Model):
    """Unified user model for all system users - staff and customers"""
    
    ROLE_CHOICES = [
        # Staff Roles
        ('pharmacist', 'Pharmacist'),
        ('technician', 'Pharmacy Technician'),
        ('manager', 'Branch Manager'),
        ('cashier', 'Cashier'),
        ('inventory_manager', 'Inventory Manager'),
        # Customer Roles
        ('customer', 'Customer'),
        ('vip_customer', 'VIP Customer'),
    ]
    
    STAFF_ROLES = ['pharmacist', 'technician', 'manager', 'cashier', 'inventory_manager']
    CUSTOMER_ROLES = ['customer', 'vip_customer']
    
    # Core user fields (common to all)
    user_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='users')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Staff-specific fields (nullable for customers)
    hire_date = models.DateField(null=True, blank=True)
    employee_id = models.CharField(max_length=20, null=True, blank=True, unique=True)
    
    # Pharmacist-specific fields
    license_number = models.CharField(max_length=50, null=True, blank=True, unique=True)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    can_validate_prescriptions = models.BooleanField(default=False)
    
    # Technician-specific fields
    certification_level = models.CharField(max_length=50, null=True, blank=True)
    supervised_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                    limit_choices_to={'role': 'pharmacist'})
    
    # Manager-specific fields
    managed_branches = models.ManyToManyField(PharmacyBranch, related_name='additional_managers', blank=True)
    
    # Cashier-specific fields
    register_number = models.CharField(max_length=10, null=True, blank=True)
    
    # Inventory Manager-specific fields
    can_approve_orders = models.BooleanField(default=False)
    
    # Customer-specific fields (nullable for staff)
    customer_id = models.CharField(max_length=20, null=True, blank=True, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    registration_date = models.DateField(null=True, blank=True)
    
    # VIP Customer-specific fields
    membership_level = models.CharField(max_length=20, null=True, blank=True)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    membership_start_date = models.DateField(null=True, blank=True)
    
    def clean(self):
        """Validate role-specific field requirements"""
        if self.role in self.STAFF_ROLES:
            if not self.employee_id:
                raise ValidationError("Staff members must have an employee_id")
            if not self.hire_date:
                raise ValidationError("Staff members must have a hire_date")
        
        if self.role in self.CUSTOMER_ROLES:
            if not self.customer_id:
                raise ValidationError("Customers must have a customer_id")
            if not self.date_of_birth:
                raise ValidationError("Customers must have a date_of_birth")
                
        if self.role == 'pharmacist':
            if not self.license_number:
                raise ValidationError("Pharmacists must have a license_number")
                
        if self.role == 'vip_customer':
            if not self.membership_level:
                raise ValidationError("VIP customers must have a membership_level")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Auto-set defaults based on role
        if self.role == 'pharmacist':
            self.can_validate_prescriptions = True
        elif self.role == 'inventory_manager':
            self.can_approve_orders = True
        elif self.role == 'vip_customer' and not self.discount_rate:
            self.discount_rate = 10.00
            
        super().save(*args, **kwargs)
    
    # Role checking methods
    def is_staff(self):
        return self.role in self.STAFF_ROLES
    
    def is_customer(self):
        return self.role in self.CUSTOMER_ROLES
    
    def is_pharmacist(self):
        return self.role == 'pharmacist'
    
    def is_vip_customer(self):
        return self.role == 'vip_customer'
    
    def can_validate_prescription(self):
        return self.role == 'pharmacist' and self.can_validate_prescriptions
    
    def can_manage_inventory(self):
        return self.role == 'inventory_manager' and self.can_approve_orders
    
    def get_display_name(self):
        if self.is_pharmacist():
            return f"Dr. {self.first_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.get_display_name()} ({self.get_role_display()})"
    
    # ============================================================================
    # DESIGN PATTERN 1: FACTORY METHOD PATTERN
    # ============================================================================
    
    @classmethod
    def create_pharmacist(cls, **kwargs):
        """Factory method for creating pharmacists with proper defaults"""
        if 'license_number' not in kwargs:
            raise ValueError("Pharmacists must have a license_number")
        
        defaults = {
            'role': 'pharmacist',
            'can_validate_prescriptions': True,
        }
        
        # Auto-generate employee_id if not provided
        if 'employee_id' not in kwargs:
            defaults['employee_id'] = f"PH{cls.objects.filter(role='pharmacist').count() + 1:04d}"
        
        defaults.update(kwargs)
        return cls.objects.create(**defaults)
    
    @classmethod
    def create_customer(cls, **kwargs):
        """Factory method for creating customers with proper defaults"""
        defaults = {
            'role': 'customer',
            'registration_date': timezone.now().date(),
        }
        
        # Auto-generate customer_id if not provided
        if 'customer_id' not in kwargs:
            defaults['customer_id'] = f"CUST{cls.objects.filter(role__in=cls.CUSTOMER_ROLES).count() + 1:06d}"
        
        defaults.update(kwargs)
        return cls.objects.create(**defaults)
    
    @classmethod
    def create_vip_customer(cls, **kwargs):
        """Factory method for creating VIP customers with benefits"""
        defaults = {
            'role': 'vip_customer',
            'membership_level': 'Gold',
            'discount_rate': 10.00,
            'membership_start_date': timezone.now().date(),
            'registration_date': timezone.now().date(),
        }
        
        # Auto-generate customer_id if not provided
        if 'customer_id' not in kwargs:
            defaults['customer_id'] = f"VIP{cls.objects.filter(role='vip_customer').count() + 1:05d}"
        
        defaults.update(kwargs)
        return cls.objects.create(**defaults)
    
    @classmethod
    def create_staff_member(cls, role, **kwargs):
        """Generic factory method for creating any staff member"""
        if role not in cls.STAFF_ROLES:
            raise ValueError(f"Invalid staff role: {role}")
        
        # Role-specific defaults
        role_defaults = {
            'pharmacist': {'can_validate_prescriptions': True},
            'inventory_manager': {'can_approve_orders': True},
            'technician': {'certification_level': 'Level 1'},
            'cashier': {},
            'manager': {},
        }
        
        defaults = {
            'role': role,
            'hire_date': timezone.now().date(),
        }
        
        # Add role-specific defaults
        defaults.update(role_defaults.get(role, {}))
        
        # Auto-generate employee_id if not provided
        if 'employee_id' not in kwargs:
            role_prefix = role[:2].upper()
            count = cls.objects.filter(role=role).count() + 1
            defaults['employee_id'] = f"{role_prefix}{count:04d}"
        
        defaults.update(kwargs)
        return cls.objects.create(**defaults)

class UserProfile(models.Model):
    """Extended profile information for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_branch = models.ForeignKey(PharmacyBranch, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Customer-specific profile fields
    allergies = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    marketing_consent = models.BooleanField(default=False)
    
    # Staff-specific profile fields
    bio = models.TextField(blank=True)
    qualifications = models.JSONField(default=list)
    languages_spoken = models.JSONField(default=list)

class LoyaltyPoint(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loyalty_points',
                               limit_choices_to={'role__in': User.CUSTOMER_ROLES})
    points = models.PositiveIntegerField(default=0)
    earned_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField()
    transaction_reference = models.CharField(max_length=100, blank=True)

# ============================================================================
# 3. Inventory Management
# ============================================================================

class InventoryRecord(models.Model):
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='inventory_records')
    product = models.ForeignKey('Medicine', on_delete=models.CASCADE)
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=10)
    reorder_point = models.PositiveIntegerField(default=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('branch', 'product')

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('stock_in', 'Stock In'),
        ('stock_out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
        ('expired', 'Expired'),
        ('transfer_in', 'Transfer In from Warehouse'),
    ]
    
    inventory_record = models.ForeignKey(InventoryRecord, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE, 
                                   limit_choices_to={'role__in': User.STAFF_ROLES})
    transaction_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

# ============================================================================
# 4. Product Hierarchy (Kept mostly the same)
# ============================================================================

class Medicine(models.Model):
    PRODUCT_TYPES = [
        ('medicine', 'Medicine'),
        ('prescription_medicine', 'Prescription Medicine'),
        ('otc_medicine', 'Over-the-Counter Medicine'),
    ]
    
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    product_type = models.CharField(max_length=30, choices=PRODUCT_TYPES, default='medicine')
    manufacturer = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    requires_prescription = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    active_ingredient = models.CharField(max_length=200)
    dosage_form = models.CharField(max_length=100)
    strength = models.CharField(max_length=100)
    therapeutic_class = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class PrescriptionMedicine(Medicine):
    controlled_substance = models.BooleanField(default=False)
    prescription_required = models.BooleanField(default=True)

class OverTheCounterMedicine(Medicine):
    age_restriction = models.PositiveIntegerField(default=0)
    max_quantity_per_purchase = models.PositiveIntegerField(default=10)

class HealthSupplement(models.Model):
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    manufacturer = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    supplement_type = models.CharField(max_length=100)
    dosage_instructions = models.TextField()
    ingredients = models.JSONField(default=list)

class MedicalDevice(models.Model):
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    manufacturer = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    device_category = models.CharField(max_length=100)
    warranty_period_months = models.PositiveIntegerField(default=12)
    requires_training = models.BooleanField(default=False)

class MedicineDatabase(models.Model):
    medicine = models.OneToOneField(Medicine, on_delete=models.CASCADE, related_name='database_info')
    drug_interactions = models.JSONField(default=list)
    contraindications = models.JSONField(default=list)
    side_effects = models.JSONField(default=list)
    storage_conditions = models.TextField()
    shelf_life_months = models.PositiveIntegerField()
    last_updated = models.DateTimeField(auto_now=True)

# ============================================================================
# 5. Order System (Simplified with unified User)
# ============================================================================

class Order(models.Model):
    """Unified order model with type differentiation"""
    ORDER_TYPES = [
        ('prescription', 'Prescription Order'),
        ('in_store', 'In-Store Order'),
        ('online', 'Online Order'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders',
                               limit_choices_to={'role__in': User.CUSTOMER_ROLES})
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_orders',
                                 limit_choices_to={'role__in': User.STAFF_ROLES})
    notes = models.TextField(blank=True)
    
    # Order type specific fields
    prescription = models.ForeignKey('Prescription', on_delete=models.SET_NULL, null=True, blank=True)
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='validated_orders', 
                                   limit_choices_to={'role': 'pharmacist'})
    validation_date = models.DateTimeField(null=True, blank=True)
    served_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='served_orders',
                                limit_choices_to={'role': 'cashier'})
    delivery_address = models.TextField(blank=True)
    delivery_instructions = models.TextField(blank=True)
    
    def is_prescription_order(self):
        return self.order_type == 'prescription'
    
    def is_online_order(self):
        return self.order_type == 'online'
    
    def requires_delivery(self):
        return self.order_type == 'online'
    
    # ============================================================================
    # DESIGN PATTERN 2: STRATEGY PATTERN - Order Processing
    # ============================================================================
    
    def get_processing_strategy(self):
        """Factory method to get appropriate processing strategy"""
        strategies = {
            'prescription': PrescriptionOrderStrategy(),
            'in_store': InStoreOrderStrategy(),
            'online': OnlineOrderStrategy(),
        }
        return strategies.get(self.order_type)
    
    def process_order(self):
        """Process order using appropriate strategy"""
        strategy = self.get_processing_strategy()
        if strategy:
            return strategy.process(self)
        raise ValueError(f"No processing strategy for order type: {self.order_type}")
    
    def calculate_total_with_strategy(self):
        """Calculate total using order-type specific strategy"""
        strategy = self.get_processing_strategy()
        if strategy:
            return strategy.calculate_total(self)
        return self.total_amount
    
    # ============================================================================
    # DESIGN PATTERN 3: STATE PATTERN - Order Status Management
    # ============================================================================
    
    def get_state_handler(self):
        """Get current state handler"""
        state_handlers = {
            'pending': PendingOrderState(),
            'processing': ProcessingOrderState(),
            'completed': CompletedOrderState(),
            'cancelled': CancelledOrderState(),
        }
        return state_handlers.get(self.status)
    
    def can_transition_to(self, new_status):
        """Check if transition to new status is valid"""
        current_state = self.get_state_handler()
        return current_state.can_transition_to(new_status) if current_state else False
    
    def transition_to(self, new_status, user=None):
        """Safely transition to new status with validation"""
        if not self.can_transition_to(new_status):
            raise ValueError(f"Cannot transition from {self.status} to {new_status}")
        
        # Get current state handler and process transition
        current_state = self.get_state_handler()
        if current_state:
            current_state.on_exit(self, user)
        
        # Update status
        old_status = self.status
        self.status = new_status
        
        # Process new state
        new_state = self.get_state_handler()
        if new_state:
            new_state.on_enter(self, user)
        
        self.save()
        return f"Order {self.order_number} transitioned from {old_status} to {new_status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

# ============================================================================
# 6. Prescription System (Updated to use User)
# ============================================================================

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('validated', 'Validated'),
        ('dispensed', 'Dispensed'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    prescription_number = models.CharField(max_length=30, unique=True)
    patient_name = models.CharField(max_length=200)
    patient_dob = models.DateField()
    doctor_name = models.CharField(max_length=200)
    doctor_license = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions',
                                   limit_choices_to={'role__in': User.CUSTOMER_ROLES})
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='validated_prescriptions',
                                   limit_choices_to={'role': 'pharmacist'})
    validation_date = models.DateTimeField(null=True, blank=True)
    validation_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    quantity_prescribed = models.PositiveIntegerField()
    quantity_dispensed = models.PositiveIntegerField(default=0)
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# ============================================================================
# 7. Delivery System (Simplified)
# ============================================================================

class Delivery(models.Model):
    """Unified delivery model with type differentiation"""
    DELIVERY_TYPES = [
        ('pickup', 'Pickup Delivery'),
        ('home', 'Home Delivery'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ready', 'Ready for Pickup'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date = models.DateTimeField()
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(blank=True)
    assigned_staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                     limit_choices_to={'role__in': User.STAFF_ROLES})
    delivered_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Delivery type specific fields
    pickup_location = models.CharField(max_length=200, blank=True)
    customer_notified = models.BooleanField(default=False)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_delivery_time = models.DurationField(null=True, blank=True)
    gps_coordinates = models.CharField(max_length=100, blank=True)
    
    def is_pickup_delivery(self):
        return self.delivery_type == 'pickup'
    
    def is_home_delivery(self):
        return self.delivery_type == 'home'

# ============================================================================
# 9. DESIGN PATTERN IMPLEMENTATIONS
# ============================================================================

# ============================================================================
# STRATEGY PATTERN - Order Processing Strategies
# ============================================================================

class OrderProcessingStrategy:
    """Strategy interface for order processing"""
    
    def process(self, order):
        """Process the order according to type-specific rules"""
        raise NotImplementedError("Subclasses must implement process method")
    
    def calculate_total(self, order):
        """Calculate total with type-specific logic"""
        raise NotImplementedError("Subclasses must implement calculate_total method")
    
    def validate_order(self, order):
        """Validate order according to type-specific rules"""
        raise NotImplementedError("Subclasses must implement validate_order method")

class PrescriptionOrderStrategy(OrderProcessingStrategy):
    """Strategy for processing prescription orders"""
    
    def process(self, order):
        """Process prescription order with validation requirements"""
        if not order.prescription:
            raise ValueError("Prescription order must have a valid prescription")
        
        if not order.validated_by or not order.validated_by.can_validate_prescription():
            raise ValueError("Prescription must be validated by qualified pharmacist")
        
        # Check prescription items availability
        for item in order.items.all():
            if not item.product.requires_prescription:
                raise ValueError(f"Product {item.product.name} doesn't require prescription")
        
        return {
            'status': 'processed',
            'message': 'Prescription order processed successfully',
            'requires_pharmacist_approval': True
        }
    
    def calculate_total(self, order):
        """Calculate total for prescription orders (may include consultation fees)"""
        base_total = sum(item.total_price for item in order.items.all())
        consultation_fee = 25.00  # Standard consultation fee
        return base_total + consultation_fee
    
    def validate_order(self, order):
        """Validate prescription order requirements"""
        if order.order_type != 'prescription':
            return False
        return bool(order.prescription and order.validated_by)

class InStoreOrderStrategy(OrderProcessingStrategy):
    """Strategy for processing in-store orders"""
    
    def process(self, order):
        """Process in-store order with immediate availability check"""
        # Check inventory availability
        for item in order.items.all():
            inventory = InventoryRecord.objects.filter(
                branch=order.branch,
                product=item.product
            ).first()
            
            if not inventory or inventory.current_stock < item.quantity:
                raise ValueError(f"Insufficient stock for {item.product.name}")
        
        return {
            'status': 'processed',
            'message': 'In-store order processed successfully',
            'requires_immediate_fulfillment': True
        }
    
    def calculate_total(self, order):
        """Calculate total for in-store orders (no additional fees)"""
        base_total = sum(item.total_price for item in order.items.all())
        
        # Apply VIP discount if customer is VIP
        if order.customer.is_vip_customer() and order.customer.discount_rate:
            discount = base_total * (order.customer.discount_rate / 100)
            return base_total - discount
        
        return base_total
    
    def validate_order(self, order):
        """Validate in-store order requirements"""
        return order.order_type == 'in_store' and order.served_by

class OnlineOrderStrategy(OrderProcessingStrategy):
    """Strategy for processing online orders"""
    
    def process(self, order):
        """Process online order with delivery requirements"""
        if not order.delivery_address:
            raise ValueError("Online order must have delivery address")
        
        # Check if products can be shipped
        for item in order.items.all():
            if hasattr(item.product, 'requires_prescription') and item.product.requires_prescription:
                if not order.prescription:
                    raise ValueError("Prescription items require valid prescription")
        
        return {
            'status': 'processed',
            'message': 'Online order processed successfully',
            'requires_delivery': True,
            'estimated_delivery': '2-3 business days'
        }
    
    def calculate_total(self, order):
        """Calculate total for online orders (includes delivery fee)"""
        base_total = sum(item.total_price for item in order.items.all())
        delivery_fee = 15.00  # Standard delivery fee
        
        # Free delivery for orders over $100
        if base_total > 100:
            delivery_fee = 0
        
        return base_total + delivery_fee
    
    def validate_order(self, order):
        """Validate online order requirements"""
        return (order.order_type == 'online' and 
                bool(order.delivery_address))

# ============================================================================
# STATE PATTERN - Order Status Management
# ============================================================================

class OrderState:
    """State interface for order status management"""
    
    def can_transition_to(self, new_status):
        """Check if transition to new status is allowed"""
        return False
    
    def on_enter(self, order, user=None):
        """Actions to perform when entering this state"""
        pass
    
    def on_exit(self, order, user=None):
        """Actions to perform when exiting this state"""
        pass
    
    def get_allowed_actions(self, order):
        """Get list of allowed actions in this state"""
        return []

class PendingOrderState(OrderState):
    """State for pending orders"""
    
    def can_transition_to(self, new_status):
        """Pending orders can transition to processing or cancelled"""
        return new_status in ['processing', 'cancelled']
    
    def on_enter(self, order, user=None):
        """Actions when order becomes pending"""
        # Create audit log
        print(f"Order {order.order_number} is now pending review")
        
        # Notify relevant staff
        if order.order_type == 'prescription':
            print(f"Prescription order requires pharmacist validation")
    
    def get_allowed_actions(self, order):
        """Actions allowed for pending orders"""
        return ['edit_items', 'cancel_order', 'begin_processing']

class ProcessingOrderState(OrderState):
    """State for orders being processed"""
    
    def can_transition_to(self, new_status):
        """Processing orders can transition to completed or cancelled"""
        return new_status in ['completed', 'cancelled']
    
    def on_enter(self, order, user=None):
        """Actions when order enters processing"""
        print(f"Order {order.order_number} is now being processed")
        
        # Reserve inventory
        for item in order.items.all():
            # Here you would implement inventory reservation
            print(f"Reserved {item.quantity} units of {item.product.name}")
        
        # Assign to appropriate staff based on order type
        if order.order_type == 'prescription' and not order.validated_by:
            print("Assigning to available pharmacist for validation")
    
    def on_exit(self, order, user=None):
        """Actions when leaving processing state"""
        if order.status == 'cancelled':
            # Release reserved inventory
            print(f"Releasing reserved inventory for cancelled order {order.order_number}")
    
    def get_allowed_actions(self, order):
        """Actions allowed for processing orders"""
        return ['update_status', 'add_notes', 'complete_order', 'cancel_order']

class CompletedOrderState(OrderState):
    """State for completed orders"""
    
    def can_transition_to(self, new_status):
        """Completed orders generally cannot transition (immutable)"""
        return False  # Completed orders are final
    
    def on_enter(self, order, user=None):
        """Actions when order is completed"""
        print(f"Order {order.order_number} has been completed")
        
        # Update inventory
        for item in order.items.all():
            inventory = InventoryRecord.objects.filter(
                branch=order.branch,
                product=item.product
            ).first()
            
            if inventory:
                # Create inventory transaction
                InventoryTransaction.objects.create(
                    inventory_record=inventory,
                    transaction_type='stock_out',
                    quantity=-item.quantity,
                    previous_stock=inventory.current_stock,
                    new_stock=inventory.current_stock - item.quantity,
                    performed_by=user or order.created_by,
                    notes=f"Order completion: {order.order_number}"
                )
                
                # Update current stock
                inventory.current_stock -= item.quantity
                inventory.save()
        
        # Award loyalty points for customers
        if order.customer.is_customer():
            points = int(order.total_amount / 10)  # 1 point per $10 spent
            LoyaltyPoint.objects.create(
                customer=order.customer,
                points=points,
                expiry_date=timezone.now().date() + timezone.timedelta(days=365),
                transaction_reference=order.order_number
            )
    
    def get_allowed_actions(self, order):
        """Actions allowed for completed orders"""
        return ['view_details', 'download_receipt', 'reorder']

class CancelledOrderState(OrderState):
    """State for cancelled orders"""
    
    def can_transition_to(self, new_status):
        """Cancelled orders cannot transition to other states"""
        return False  # Cancelled orders are final
    
    def on_enter(self, order, user=None):
        """Actions when order is cancelled"""
        print(f"Order {order.order_number} has been cancelled")
        
        # Release any reserved inventory
        # Send cancellation notifications
        # Process any refunds if applicable
    
    def get_allowed_actions(self, order):
        """Actions allowed for cancelled orders"""
        return ['view_details', 'create_new_order']

class ProductFactory(models.Model):
    """Factory for creating different product types"""
    factory_name = models.CharField(max_length=100, unique=True)
    supported_product_types = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def create_medicine(cls, **kwargs):
        return Medicine.objects.create(**kwargs)
    
    @classmethod
    def create_supplement(cls, **kwargs):
        return HealthSupplement.objects.create(**kwargs)

class ReportGenerator(models.Model):
    REPORT_TYPES = [
        ('sales', 'Sales Report'),
        ('inventory', 'Inventory Report'),
        ('prescription', 'Prescription Report'),
        ('staff_performance', 'Staff Performance Report'),
    ]
    
    report_name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='reports')
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   limit_choices_to={'role__in': User.STAFF_ROLES})
    start_date = models.DateField()
    end_date = models.DateField()
    report_data = models.JSONField(default=dict)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def track_performance(self, staff_member):
        """Track staff performance for reports"""
        performance_data = {
            'staff_id': staff_member.user_id,
            'staff_role': staff_member.role,
            'period': f"{self.start_date} to {self.end_date}"
        }
        return performance_data
    
class Warehouse(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                               limit_choices_to={'role': 'inventory_manager'})
    capacity = models.PositiveIntegerField(help_text="Total storage capacity in units")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def get_total_stock(self):
        return sum(record.current_stock for record in self.warehouse_inventory.all())
    
    def get_utilization_percentage(self):
        total_stock = self.get_total_stock()
        return (total_stock / self.capacity * 100) if self.capacity > 0 else 0

class WarehouseInventoryRecord(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='warehouse_inventory')
    product = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=50)
    reorder_point = models.PositiveIntegerField(default=100)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supplier = models.CharField(max_length=200, blank=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('warehouse', 'product')
    
    def __str__(self):
        return f"{self.warehouse.name} - {self.product.name} ({self.current_stock} units)"
    
    def is_low_stock(self):
        return self.current_stock <= self.reorder_point
    
    def can_fulfill_branch_request(self, quantity):
        return self.current_stock >= quantity
    
class WarehouseInventoryTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('stock_in', 'Stock In (Purchase)'),
        ('stock_out', 'Stock Out (Transfer to Branch)'),
        ('adjustment', 'Adjustment'),
        ('damaged', 'Damaged/Lost'),
        ('expired', 'Expired'),
    ]
    
    warehouse_record = models.ForeignKey(WarehouseInventoryRecord, on_delete=models.CASCADE,
                                       related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   limit_choices_to={'role__in': User.STAFF_ROLES})
    transaction_date = models.DateTimeField(auto_now_add=True)
    purchase_order_number = models.CharField(max_length=50, blank=True)
    transfer_reference = models.CharField(max_length=50, blank=True)
    supplier_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.warehouse_record.warehouse.name} - {self.get_transaction_type_display()} - {self.quantity}"
    
class InventoryTransfer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    transfer_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    source_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='outgoing_transfers')
    destination_branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='incoming_transfers')
    product = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_transfers',
                                   limit_choices_to={'role__in': ['manager', 'inventory_manager']})
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='approved_transfers',
                                  limit_choices_to={'role': 'inventory_manager'})
    request_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    shipped_date = models.DateTimeField(null=True, blank=True)
    received_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def can_approve(self, user):
        return (user.role == 'inventory_manager' and 
                user.can_approve_orders and 
                self.status == 'pending')
    
    def approve(self, approver):
        if not self.can_approve(approver):
            raise ValueError("Transfer cannot be approved by this user or in current status")
        
        warehouse_record = WarehouseInventoryRecord.objects.get(
            warehouse=self.source_warehouse, product=self.product)
        if not warehouse_record.can_fulfill_branch_request(self.quantity):
            raise ValueError(f"Insufficient warehouse stock")
        
        self.status = 'approved'
        self.approved_by = approver
        self.approved_date = timezone.now()
        self.save()
    
    def complete_transfer(self, receiving_user):
        if self.status != 'approved':
            raise ValueError("Transfer must be approved before completion")
        
        # Decrease warehouse stock
        warehouse_record = WarehouseInventoryRecord.objects.get(
            warehouse=self.source_warehouse, product=self.product)
        warehouse_record.current_stock -= self.quantity
        warehouse_record.save()
        
        # Create warehouse transaction
        WarehouseInventoryTransaction.objects.create(
            warehouse_record=warehouse_record,
            transaction_type='stock_out',
            quantity=-self.quantity,
            previous_stock=warehouse_record.current_stock + self.quantity,
            new_stock=warehouse_record.current_stock,
            performed_by=receiving_user,
            transfer_reference=self.transfer_number,
            notes=f"Transfer to {self.destination_branch.name}"
        )
        
        # Increase branch stock
        branch_record, created = InventoryRecord.objects.get_or_create(
            branch=self.destination_branch, product=self.product,
            defaults={'current_stock': 0})
        previous_branch_stock = branch_record.current_stock
        branch_record.current_stock += self.quantity
        branch_record.save()
        
        # Create branch transaction
        InventoryTransaction.objects.create(
            inventory_record=branch_record,
            transaction_type='stock_in',
            quantity=self.quantity,
            previous_stock=previous_branch_stock,
            new_stock=branch_record.current_stock,
            performed_by=receiving_user,
            notes=f"Transfer from warehouse: {self.transfer_number}"
        )
        
        self.status = 'completed'
        self.received_date = timezone.now()
        self.save()
    
    def __str__(self):
        return f"{self.transfer_number} - {self.product.name} ({self.quantity} units)"
    
class UserAccount(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_profile = models.OneToOneField(User, on_delete=models.CASCADE, 
                                       related_name='account', null=True, blank=True)
    
    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password_hash = make_password(raw_password)
        self.password_changed_at = timezone.now()
    
    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)
    
    def is_account_locked(self):
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    @classmethod
    def authenticate(cls, username, password):
        try:
            account = cls.objects.get(username=username, is_active=True)
            if account.is_account_locked():
                return None, "Account is temporarily locked"
            if account.check_password(password):
                account.last_login = timezone.now()
                account.failed_login_attempts = 0
                account.save()
                return account, "Login successful"
            else:
                account.failed_login_attempts += 1
                if account.failed_login_attempts >= 5:
                    account.account_locked_until = timezone.now() + timedelta(minutes=30)
                account.save()
                return None, "Invalid credentials"
        except cls.DoesNotExist:
            return None, "Invalid credentials"
    
    def __str__(self):
        return f"{self.username} ({self.email})"