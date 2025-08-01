# core/admin.py - UPDATED FOR UNIFIED USER SYSTEM

from django.contrib import admin
from django.utils.html import format_html
from .models import *

# ============================================================================
# UNIFIED USER SYSTEM ADMIN
# ============================================================================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'get_display_name', 'role', 'email', 'branch', 'is_active']
    list_filter = ['role', 'is_active', 'branch', 'created_at']
    search_fields = ['user_id', 'first_name', 'last_name', 'email', 'employee_id', 'customer_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user_id', 'first_name', 'last_name', 'email', 'phone', 'role', 'branch', 'is_active')
        }),
        ('Staff Information', {
            'fields': ('employee_id', 'hire_date', 'license_number', 'specialization', 
                      'can_validate_prescriptions', 'certification_level', 'supervised_by',
                      'register_number', 'can_approve_orders'),
            'classes': ('collapse',),
            'description': 'Fields for staff members only'
        }),
        ('Customer Information', {
            'fields': ('customer_id', 'date_of_birth', 'address', 'registration_date',
                      'membership_level', 'discount_rate', 'membership_start_date'),
            'classes': ('collapse',),
            'description': 'Fields for customers only'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def get_display_name(self, obj):
        return obj.get_display_name()
    get_display_name.short_description = 'Name'
    
    # Custom actions using Factory Methods
    actions = ['create_sample_pharmacist', 'create_sample_customer']
    
    def create_sample_pharmacist(self, request, queryset):
        try:
            User.create_pharmacist(
                first_name="Sample",
                last_name="Pharmacist", 
                email="sample.pharmacist@pharmacy.com",
                phone="123-456-7890",
                branch_id=1,
                license_number="PH123456"
            )
            self.message_user(request, "Sample pharmacist created successfully using Factory Method!")
        except Exception as e:
            self.message_user(request, f"Error: {e}", level='ERROR')
    
    create_sample_pharmacist.short_description = "Create sample pharmacist (Factory Method)"

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_branch', 'emergency_contact_name']
    list_filter = ['preferred_branch']
    search_fields = ['user__first_name', 'user__last_name', 'emergency_contact_name']

@admin.register(LoyaltyPoint)
class LoyaltyPointAdmin(admin.ModelAdmin):
    list_display = ['customer', 'points', 'earned_date', 'expiry_date']
    list_filter = ['earned_date', 'expiry_date']
    search_fields = ['customer__first_name', 'customer__last_name']

# ============================================================================
# BRANCH AND CONFIGURATION
# ============================================================================

@admin.register(PharmacyBranch)
class PharmacyBranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'phone', 'email', 'user_count']
    search_fields = ['name', 'address']
    
    def user_count(self, obj):
        return obj.users.count()
    user_count.short_description = 'Total Users'

@admin.register(BranchConfiguration)
class BranchConfigurationAdmin(admin.ModelAdmin):
    list_display = ['branch', 'max_prescriptions_per_day', 'emergency_contact']

# ============================================================================
# INVENTORY MANAGEMENT
# ============================================================================

@admin.register(InventoryRecord)
class InventoryRecordAdmin(admin.ModelAdmin):
    list_display = ['product', 'branch', 'current_stock', 'minimum_stock', 'stock_status']
    list_filter = ['branch']
    search_fields = ['product__name', 'product__product_code']
    
    def stock_status(self, obj):
        if obj.current_stock == 0:
            return format_html('<span style="color: red;">Out of Stock</span>')
        elif obj.current_stock <= obj.reorder_point:
            return format_html('<span style="color: orange;">Low Stock</span>')
        else:
            return format_html('<span style="color: green;">In Stock</span>')
    stock_status.short_description = 'Status'

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['inventory_record', 'transaction_type', 'quantity', 'transaction_date', 'performed_by']
    list_filter = ['transaction_type', 'transaction_date']
    readonly_fields = ['transaction_date']

# ============================================================================
# PRODUCT MANAGEMENT
# ============================================================================

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'active_ingredient', 'strength', 'price', 'is_available']
    list_filter = ['therapeutic_class', 'dosage_form', 'product_type', 'is_available']
    search_fields = ['product_code', 'name', 'active_ingredient']

@admin.register(PrescriptionMedicine)
class PrescriptionMedicineAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'active_ingredient', 'controlled_substance', 'price']
    list_filter = ['controlled_substance', 'therapeutic_class']

@admin.register(OverTheCounterMedicine)
class OverTheCounterMedicineAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'age_restriction', 'max_quantity_per_purchase', 'price']
    list_filter = ['age_restriction']

@admin.register(HealthSupplement)
class HealthSupplementAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'supplement_type', 'price']
    list_filter = ['supplement_type']

@admin.register(MedicalDevice)
class MedicalDeviceAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'device_category', 'warranty_period_months', 'price']
    list_filter = ['device_category', 'requires_training']

@admin.register(MedicineDatabase)
class MedicineDatabaseAdmin(admin.ModelAdmin):
    list_display = ['medicine', 'shelf_life_months', 'last_updated']
    search_fields = ['medicine__name']

# ============================================================================
# ORDER MANAGEMENT (UNIFIED ORDER SYSTEM)
# ============================================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'order_type', 'customer', 'branch', 'status', 'total_amount', 'order_date']
    list_filter = ['order_type', 'status', 'branch', 'order_date']
    search_fields = ['order_number', 'customer__first_name', 'customer__last_name']
    readonly_fields = ['order_date']
    
    # Custom actions using State Pattern
    actions = ['transition_to_processing', 'transition_to_completed']
    
    def transition_to_processing(self, request, queryset):
        for order in queryset:
            try:
                result = order.transition_to('processing')
                self.message_user(request, f"Order {order.order_number}: {result}")
            except ValueError as e:
                self.message_user(request, f"Order {order.order_number}: {e}", level='ERROR')
    
    transition_to_processing.short_description = "Transition to Processing (State Pattern)"
    
    def transition_to_completed(self, request, queryset):
        for order in queryset:
            try:
                result = order.transition_to('completed')
                self.message_user(request, f"Order {order.order_number}: {result}")
            except ValueError as e:
                self.message_user(request, f"Order {order.order_number}: {e}", level='ERROR')
    
    transition_to_completed.short_description = "Transition to Completed (State Pattern)"

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    search_fields = ['product__name', 'order__order_number']

# ============================================================================
# PRESCRIPTION SYSTEM
# ============================================================================

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['prescription_number', 'patient_name', 'doctor_name', 'status', 'issue_date']
    list_filter = ['status', 'issue_date']
    search_fields = ['prescription_number', 'patient_name', 'doctor_name']

@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ['prescription', 'medicine', 'dosage', 'quantity_prescribed', 'quantity_dispensed']
    search_fields = ['prescription__prescription_number', 'medicine__name']

# ============================================================================
# DELIVERY SYSTEM (UNIFIED DELIVERY)
# ============================================================================

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order', 'delivery_type', 'status', 'scheduled_date', 'delivery_fee']
    list_filter = ['delivery_type', 'status', 'scheduled_date']
    search_fields = ['order__order_number']

# ============================================================================
# FACTORY AND REPORTS
# ============================================================================

@admin.register(ProductFactory)
class ProductFactoryAdmin(admin.ModelAdmin):
    list_display = ['factory_name', 'created_at']
    
    # Demonstrate Factory Pattern in admin
    actions = ['create_sample_medicine', 'create_sample_supplement']
    
    def create_sample_medicine(self, request, queryset):
        try:
            medicine = ProductFactory.create_medicine(
                product_code="MED001",
                name="Sample Medicine",
                manufacturer="Sample Pharma",
                description="Sample medicine for testing",
                price=25.50,
                active_ingredient="Sample Ingredient",
                dosage_form="Tablet",
                strength="500mg",
                therapeutic_class="Analgesic"
            )
            self.message_user(request, f"Medicine created: {medicine.name} (Factory Pattern)")
        except Exception as e:
            self.message_user(request, f"Error: {e}", level='ERROR')
    
    create_sample_medicine.short_description = "Create sample medicine (Factory Pattern)"

@admin.register(ReportGenerator)
class ReportGeneratorAdmin(admin.ModelAdmin):
    list_display = ['report_name', 'report_type', 'branch', 'generated_by', 'generated_at']
    list_filter = ['report_type', 'branch', 'generated_at']