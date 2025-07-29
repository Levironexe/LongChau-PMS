# api/serializers.py - REPLACE YOUR ENTIRE FILE WITH THIS
from rest_framework import serializers
from core.models import *

class PharmacyBranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyBranch
        fields = '__all__'

class BranchConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchConfiguration
        fields = '__all__'

# ============================================================================
# CONCRETE STAFF SERIALIZERS (NO ABSTRACT Staff)
# ============================================================================

class PharmacistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacist
        fields = '__all__'

class PharmacyTechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyTechnician
        fields = '__all__'

class BranchManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchManager
        fields = '__all__'

class CashierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cashier
        fields = '__all__'

class InventoryManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryManager
        fields = '__all__'

# ============================================================================
# CUSTOMER SERIALIZERS
# ============================================================================

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class VIPCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = VIPCustomer
        fields = '__all__'

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = '__all__'

# ============================================================================
# CONCRETE PRODUCT SERIALIZERS (NO ABSTRACT Product)
# ============================================================================

class MedicineSerializer(serializers.ModelSerializer):
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = '__all__'
    
    def get_current_stock(self, obj):
        branch_id = self.context.get('branch_id')
        if branch_id:
            try:
                inventory = obj.inventoryrecord_set.get(branch_id=branch_id)
                return inventory.current_stock
            except InventoryRecord.DoesNotExist:
                return 0
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

# ============================================================================
# INVENTORY SERIALIZERS
# ============================================================================

class InventoryRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryRecord
        fields = '__all__'
    
    def get_is_low_stock(self, obj):
        return obj.current_stock <= obj.reorder_point

class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = '__all__'

# ============================================================================
# CONCRETE ORDER SERIALIZERS (NO ABSTRACT Order)
# ============================================================================

class PrescriptionOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    
    class Meta:
        model = PrescriptionOrder
        fields = '__all__'
    
    def get_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

class InStoreOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    
    class Meta:
        model = InStoreOrder
        fields = '__all__'
    
    def get_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

class OnlineOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    
    class Meta:
        model = OnlineOrder
        fields = '__all__'
    
    def get_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

# ============================================================================
# PRESCRIPTION SERIALIZERS
# ============================================================================

class PrescriptionSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = '__all__'
    
    def get_items(self, obj):
        return PrescriptionItemSerializer(obj.items.all(), many=True).data

class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = '__all__'

# ============================================================================
# CONCRETE DELIVERY SERIALIZERS (NO ABSTRACT Delivery)
# ============================================================================

class PickUpDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = PickUpDelivery
        fields = '__all__'

class HomeDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeDelivery
        fields = '__all__'

# ============================================================================
# FACTORY AND REPORT SERIALIZERS
# ============================================================================

class ProductFactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFactory
        fields = '__all__'

class ReportGeneratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportGenerator
        fields = '__all__'
