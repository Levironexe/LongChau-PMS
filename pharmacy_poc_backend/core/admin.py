# core/admin.py - REPLACE YOUR ENTIRE FILE WITH THIS

from django.contrib import admin
from .models import *

# ============================================================================
# REGISTER ONLY CONCRETE MODELS (NO ABSTRACT ONES)
# ============================================================================

@admin.register(PharmacyBranch)
class PharmacyBranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'phone', 'email']
    search_fields = ['name', 'address']

@admin.register(BranchConfiguration)
class BranchConfigurationAdmin(admin.ModelAdmin):
    list_display = ['branch', 'max_prescriptions_per_day', 'emergency_contact']

@admin.register(InventoryRecord)
class InventoryRecordAdmin(admin.ModelAdmin):
    list_display = ['product', 'branch', 'current_stock', 'minimum_stock', 'reorder_point']
    list_filter = ['branch']
    search_fields = ['product__name', 'product__product_code']

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['inventory_record', 'transaction_type', 'quantity', 'transaction_date', 'performed_by']
    list_filter = ['transaction_type', 'transaction_date']

# ============================================================================
# CONCRETE STAFF MODELS (NO ABSTRACT Staff)
# ============================================================================

@admin.register(Pharmacist)
class PharmacistAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'license_number', 'branch']
    list_filter = ['branch', 'specialization']
    search_fields = ['employee_id', 'first_name', 'last_name', 'license_number']

@admin.register(PharmacyTechnician)
class PharmacyTechnicianAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'certification_level', 'branch']
    list_filter = ['branch', 'certification_level']

@admin.register(BranchManager)
class BranchManagerAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'branch']
    list_filter = ['branch']

@admin.register(Cashier)
class CashierAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'register_number', 'branch']
    list_filter = ['branch']

@admin.register(InventoryManager)
class InventoryManagerAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'can_approve_orders', 'branch']
    list_filter = ['branch', 'can_approve_orders']

# ============================================================================
# CUSTOMER MODELS
# ============================================================================

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'first_name', 'last_name', 'email', 'phone']
    search_fields = ['customer_id', 'first_name', 'last_name', 'email']

@admin.register(VIPCustomer)
class VIPCustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'first_name', 'last_name', 'membership_level', 'discount_rate']
    list_filter = ['membership_level']

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['customer', 'preferred_branch', 'emergency_contact_name']
    list_filter = ['preferred_branch']

@admin.register(LoyaltyPoint)
class LoyaltyPointAdmin(admin.ModelAdmin):
    list_display = ['customer', 'points', 'earned_date', 'expiry_date']
    list_filter = ['earned_date', 'expiry_date']

# ============================================================================
# PRODUCT MODELS (CONCRETE ONLY)
# ============================================================================

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['product_code', 'name', 'active_ingredient', 'strength', 'price']
    list_filter = ['therapeutic_class', 'dosage_form', 'product_type']
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
# CONCRETE ORDER MODELS (NO ABSTRACT Order)
# ============================================================================

@admin.register(PrescriptionOrder)
class PrescriptionOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'branch', 'status', 'total_amount', 'order_date']
    list_filter = ['status', 'branch', 'order_date']
    search_fields = ['order_number', 'customer__first_name', 'customer__last_name']

@admin.register(InStoreOrder)
class InStoreOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'branch', 'status', 'total_amount', 'served_by']
    list_filter = ['status', 'branch', 'order_date']
    search_fields = ['order_number', 'customer__first_name']

@admin.register(OnlineOrder)
class OnlineOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'branch', 'status', 'total_amount', 'order_date']
    list_filter = ['status', 'branch', 'order_date']
    search_fields = ['order_number', 'customer__first_name']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['get_order_number', 'product', 'quantity', 'unit_price', 'total_price']
    list_filter = ['prescription_order__status', 'instore_order__status', 'online_order__status']
    search_fields = ['product__name']
    
    def get_order_number(self, obj):
        if obj.prescription_order:
            return f"PRX-{obj.prescription_order.order_number}"
        elif obj.instore_order:
            return f"INS-{obj.instore_order.order_number}"
        elif obj.online_order:
            return f"ONL-{obj.online_order.order_number}"
        return "No Order"
    get_order_number.short_description = 'Order Number'

# ============================================================================
# PRESCRIPTION MODELS
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
# CONCRETE DELIVERY MODELS (NO ABSTRACT Delivery)
# ============================================================================

@admin.register(PickUpDelivery)
class PickUpDeliveryAdmin(admin.ModelAdmin):
    list_display = ['get_order_number', 'status', 'scheduled_date', 'pickup_location', 'customer_notified']
    list_filter = ['status', 'scheduled_date', 'customer_notified']
    
    def get_order_number(self, obj):
        order = obj.order
        if order:
            return order.order_number
        return "No Order"
    get_order_number.short_description = 'Order Number'

@admin.register(HomeDelivery)
class HomeDeliveryAdmin(admin.ModelAdmin):
    list_display = ['get_order_number', 'status', 'scheduled_date', 'delivery_fee', 'delivered_date']
    list_filter = ['status', 'scheduled_date']
    
    def get_order_number(self, obj):
        order = obj.order
        if order:
            return order.order_number
        return "No Order"
    get_order_number.short_description = 'Order Number'

# ============================================================================
# FACTORY AND REPORT MODELS
# ============================================================================

@admin.register(ProductFactory)
class ProductFactoryAdmin(admin.ModelAdmin):
    list_display = ['factory_name', 'created_at']

@admin.register(ReportGenerator)
class ReportGeneratorAdmin(admin.ModelAdmin):
    list_display = ['report_name', 'report_type', 'branch', 'generated_by', 'generated_at']
    list_filter = ['report_type', 'branch', 'generated_at']