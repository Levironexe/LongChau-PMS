# core/models.py - COMPLETELY FIXED VERSION

from django.db import models
from django.utils import timezone

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

class InventoryRecord(models.Model):
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='inventory_records')
    product = models.ForeignKey('Medicine', on_delete=models.CASCADE)  # Changed to concrete model
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
    ]
    
    inventory_record = models.ForeignKey(InventoryRecord, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    performed_by = models.ForeignKey('Pharmacist', on_delete=models.CASCADE)  # Changed to concrete model
    transaction_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

# ============================================================================
# 2. Concrete Staff Classes (NO ABSTRACT Staff)
# ============================================================================

class Pharmacist(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='pharmacists')
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Pharmacist-specific fields
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100, blank=True)
    can_validate_prescriptions = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"

class PharmacyTechnician(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='technicians')
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Technician-specific fields
    certification_level = models.CharField(max_length=50)
    supervised_by = models.ForeignKey(Pharmacist, on_delete=models.SET_NULL, null=True, blank=True)

class BranchManager(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='managers')
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Manager-specific fields
    managed_branches = models.ManyToManyField(PharmacyBranch, related_name='additional_managers')

class Cashier(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='cashiers')
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Cashier-specific fields
    register_number = models.CharField(max_length=10, blank=True)

class InventoryManager(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='inventory_managers')
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # InventoryManager-specific fields
    can_approve_orders = models.BooleanField(default=True)

# ============================================================================
# 3. Customer Hierarchy
# ============================================================================

class Customer(models.Model):
    customer_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    address = models.TextField()
    registration_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class VIPCustomer(Customer):
    membership_level = models.CharField(max_length=20, default='Gold')
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    membership_start_date = models.DateField(auto_now_add=True)

class CustomerProfile(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='profile')
    preferred_branch = models.ForeignKey(PharmacyBranch, on_delete=models.SET_NULL, null=True, blank=True)
    allergies = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=20)
    marketing_consent = models.BooleanField(default=False)

class LoyaltyPoint(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty_points')
    points = models.PositiveIntegerField(default=0)
    earned_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField()
    transaction_reference = models.CharField(max_length=100, blank=True)

# ============================================================================
# 4. Product Hierarchy
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
    # Medicine-specific fields
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
    # HealthSupplement-specific fields
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
    # MedicalDevice-specific fields
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
# 5. Concrete Order Classes (NO ABSTRACT Order)
# ============================================================================

class PrescriptionOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescription_orders')
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=20, default='prescription')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(Pharmacist, on_delete=models.CASCADE, related_name='created_prescription_orders')
    prescription = models.ForeignKey('Prescription', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    # PrescriptionOrder-specific fields
    validated_by = models.ForeignKey(Pharmacist, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_prescription_orders')
    validation_date = models.DateTimeField(null=True, blank=True)

class InStoreOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='instore_orders')
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=20, default='in_store')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(Pharmacist, on_delete=models.CASCADE, related_name='created_instore_orders')
    notes = models.TextField(blank=True)
    # InStoreOrder-specific fields
    served_by = models.ForeignKey(Cashier, on_delete=models.CASCADE, related_name='served_orders')

class OnlineOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='online_orders')
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE)
    order_type = models.CharField(max_length=20, default='online')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(Pharmacist, on_delete=models.CASCADE, related_name='created_online_orders')
    notes = models.TextField(blank=True)
    # OnlineOrder-specific fields
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(blank=True)

class OrderItem(models.Model):
    # Generic foreign key to any order type
    prescription_order = models.ForeignKey(PrescriptionOrder, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    instore_order = models.ForeignKey(InStoreOrder, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    online_order = models.ForeignKey(OnlineOrder, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    
    product = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    @property 
    def order(self):
        """Get the related order regardless of type"""
        if self.prescription_order:
            return self.prescription_order
        elif self.instore_order:
            return self.instore_order
        elif self.online_order:
            return self.online_order
        return None

# ============================================================================
# 6. Prescription System
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
    submitted_by = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions')
    validated_by = models.ForeignKey(Pharmacist, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_prescriptions')
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
# 7. Concrete Delivery Classes (NO ABSTRACT Delivery)
# ============================================================================

class PickUpDelivery(models.Model):
    DELIVERY_TYPES = [
        ('pickup', 'Pickup Delivery'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ready', 'Ready for Pickup'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]
    
    # Generic foreign key to any order type
    prescription_order = models.OneToOneField(PrescriptionOrder, on_delete=models.CASCADE, related_name='pickup_delivery', null=True, blank=True)
    instore_order = models.OneToOneField(InStoreOrder, on_delete=models.CASCADE, related_name='pickup_delivery', null=True, blank=True)
    online_order = models.OneToOneField(OnlineOrder, on_delete=models.CASCADE, related_name='pickup_delivery', null=True, blank=True)
    
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, default='pickup')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date = models.DateTimeField()
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(blank=True)
    assigned_staff = models.ForeignKey(Pharmacist, on_delete=models.SET_NULL, null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # PickUpDelivery-specific fields
    pickup_location = models.CharField(max_length=200)
    customer_notified = models.BooleanField(default=False)

    @property 
    def order(self):
        """Get the related order regardless of type"""
        if self.prescription_order:
            return self.prescription_order
        elif self.instore_order:
            return self.instore_order
        elif self.online_order:
            return self.online_order
        return None

class HomeDelivery(models.Model):
    DELIVERY_TYPES = [
        ('home', 'Home Delivery'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]
    
    # Generic foreign key to any order type
    prescription_order = models.OneToOneField(PrescriptionOrder, on_delete=models.CASCADE, related_name='home_delivery', null=True, blank=True)
    instore_order = models.OneToOneField(InStoreOrder, on_delete=models.CASCADE, related_name='home_delivery', null=True, blank=True)
    online_order = models.OneToOneField(OnlineOrder, on_delete=models.CASCADE, related_name='home_delivery', null=True, blank=True)
    
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, default='home')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_date = models.DateTimeField()
    delivery_address = models.TextField()
    delivery_instructions = models.TextField(blank=True)
    assigned_staff = models.ForeignKey(Pharmacist, on_delete=models.SET_NULL, null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # HomeDelivery-specific fields
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_delivery_time = models.DurationField(null=True, blank=True)
    gps_coordinates = models.CharField(max_length=100, blank=True)

    @property 
    def order(self):
        """Get the related order regardless of type"""
        if self.prescription_order:
            return self.prescription_order
        elif self.instore_order:
            return self.instore_order
        elif self.online_order:
            return self.online_order
        return None

# ============================================================================
# 8. Factory Classes
# ============================================================================

class ProductFactory(models.Model):
    """Factory for creating different product types"""
    factory_name = models.CharField(max_length=100, unique=True)
    supported_product_types = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def create_medicine(cls, **kwargs):
        """Factory method to create medicines"""
        return Medicine.objects.create(**kwargs)
    
    @classmethod
    def create_supplement(cls, **kwargs):
        """Factory method to create supplements"""
        return HealthSupplement.objects.create(**kwargs)

# ============================================================================
# 9. ReportGenerator
# ============================================================================

class ReportGenerator(models.Model):
    """ReportGenerator as shown in UML"""
    REPORT_TYPES = [
        ('sales', 'Sales Report'),
        ('inventory', 'Inventory Report'),
        ('prescription', 'Prescription Report'),
        ('staff_performance', 'Staff Performance Report'),
    ]
    
    report_name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    branch = models.ForeignKey(PharmacyBranch, on_delete=models.CASCADE, related_name='reports')
    generated_by = models.ForeignKey(Pharmacist, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    report_data = models.JSONField(default=dict)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def track_performance(self, staff_member):
        """Track staff performance for reports"""
        performance_data = {
            'staff_id': staff_member.employee_id,
            'staff_type': staff_member.__class__.__name__,
            'period': f"{self.start_date} to {self.end_date}"
        }
        return performance_data