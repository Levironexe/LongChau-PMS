# api/views.py - Complete with all concrete models only

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.utils import timezone

# Import all models from core app
from core.models import (
    PharmacyBranch, BranchConfiguration, InventoryRecord, InventoryTransaction,
    Pharmacist, PharmacyTechnician, BranchManager, Cashier, InventoryManager,
    Customer, VIPCustomer, CustomerProfile, LoyaltyPoint,
    Medicine, PrescriptionMedicine, OverTheCounterMedicine, 
    HealthSupplement, MedicalDevice, MedicineDatabase,
    PrescriptionOrder, InStoreOrder, OnlineOrder, OrderItem,
    Prescription, PrescriptionItem,
    PickUpDelivery, HomeDelivery,
    ProductFactory, ReportGenerator
)

# Import all serializers from current app
from .serializers import (
    PharmacyBranchSerializer, BranchConfigurationSerializer,
    PharmacistSerializer, PharmacyTechnicianSerializer, BranchManagerSerializer,
    CashierSerializer, InventoryManagerSerializer,
    CustomerSerializer, VIPCustomerSerializer, CustomerProfileSerializer,
    MedicineSerializer, PrescriptionMedicineSerializer, OverTheCounterMedicineSerializer,
    HealthSupplementSerializer, MedicalDeviceSerializer,
    InventoryRecordSerializer, InventoryTransactionSerializer,
    PrescriptionOrderSerializer, InStoreOrderSerializer, OnlineOrderSerializer,
    OrderItemSerializer, PrescriptionSerializer, PrescriptionItemSerializer,
    PickUpDeliverySerializer, HomeDeliverySerializer,
    ReportGeneratorSerializer, ProductFactorySerializer
)

# ============================================================================
# API VIEWS - Core Business Operations 
# ============================================================================

class PharmacyBranchViewSet(viewsets.ModelViewSet):
    queryset = PharmacyBranch.objects.all()
    serializer_class = PharmacyBranchSerializer

class BranchConfigurationViewSet(viewsets.ModelViewSet):
    queryset = BranchConfiguration.objects.all()
    serializer_class = BranchConfigurationSerializer

# ============================================================================
# Staff ViewSets (Concrete Classes Only)
# ============================================================================

class PharmacistViewSet(viewsets.ModelViewSet):
    queryset = Pharmacist.objects.all()
    serializer_class = PharmacistSerializer

class PharmacyTechnicianViewSet(viewsets.ModelViewSet):
    queryset = PharmacyTechnician.objects.all()
    serializer_class = PharmacyTechnicianSerializer

class BranchManagerViewSet(viewsets.ModelViewSet):
    queryset = BranchManager.objects.all()
    serializer_class = BranchManagerSerializer

class CashierViewSet(viewsets.ModelViewSet):
    queryset = Cashier.objects.all()
    serializer_class = CashierSerializer

class InventoryManagerViewSet(viewsets.ModelViewSet):
    queryset = InventoryManager.objects.all()
    serializer_class = InventoryManagerSerializer

# ============================================================================
# Customer ViewSets
# ============================================================================

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    
    @action(detail=True, methods=['post'])
    def upgrade_to_vip(self, request, pk=None):
        customer = self.get_object()
        # Convert regular customer to VIP per UML
        vip_customer = VIPCustomer.objects.create(
            customer_id=customer.customer_id + "_VIP",  # Ensure unique ID
            first_name=customer.first_name,
            last_name=customer.last_name,
            email=customer.email,
            phone=customer.phone,
            date_of_birth=customer.date_of_birth,
            address=customer.address,
            membership_level='Gold',
            discount_rate=10.00
        )
        return Response({'status': 'upgraded to VIP', 'customer_id': vip_customer.id})

class VIPCustomerViewSet(viewsets.ModelViewSet):
    queryset = VIPCustomer.objects.all()
    serializer_class = VIPCustomerSerializer

class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer

# ============================================================================
# Product ViewSets (Concrete Classes Only)
# ============================================================================

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class PrescriptionMedicineViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionMedicine.objects.all()
    serializer_class = PrescriptionMedicineSerializer

class OverTheCounterMedicineViewSet(viewsets.ModelViewSet):
    queryset = OverTheCounterMedicine.objects.all()
    serializer_class = OverTheCounterMedicineSerializer

class HealthSupplementViewSet(viewsets.ModelViewSet):
    queryset = HealthSupplement.objects.all()
    serializer_class = HealthSupplementSerializer

class MedicalDeviceViewSet(viewsets.ModelViewSet):
    queryset = MedicalDevice.objects.all()
    serializer_class = MedicalDeviceSerializer

# ============================================================================
# Inventory ViewSets
# ============================================================================

class InventoryRecordViewSet(viewsets.ModelViewSet):
    queryset = InventoryRecord.objects.all()
    serializer_class = InventoryRecordSerializer
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        branch_id = request.query_params.get('branch_id')
        queryset = self.queryset
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        low_stock_items = queryset.filter(current_stock__lte=models.F('reorder_point'))
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer

# ============================================================================
# Order ViewSets (Concrete Classes Only)
# ============================================================================

class PrescriptionOrderViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionOrder.objects.all()
    serializer_class = PrescriptionOrderSerializer
    
    @transaction.atomic
    def create(self, request):
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        branch_id = request.data.get('branch_id')
        
        # Calculate total
        total = 0
        for item_data in items_data:
            try:
                product = Medicine.objects.get(id=item_data['product_id'])
                total += product.price * item_data['quantity']
            except Medicine.DoesNotExist:
                return Response({'error': f'Product {item_data["product_id"]} not found'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        # Create prescription order
        order = PrescriptionOrder.objects.create(
            order_number=f"PRX-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer_id=customer_id,
            branch_id=branch_id,
            order_type='prescription',
            total_amount=total,
            created_by_id=request.data.get('created_by_id', 1)
        )
        
        # Create order items and update inventory
        for item_data in items_data:
            product = Medicine.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
                total_price=product.price * item_data['quantity']
            )
            
            # Update inventory
            try:
                inventory = InventoryRecord.objects.get(product=product, branch_id=branch_id)
                previous_stock = inventory.current_stock
                inventory.current_stock -= item_data['quantity']
                inventory.save()
                
                InventoryTransaction.objects.create(
                    inventory_record=inventory,
                    transaction_type='stock_out',
                    quantity=-item_data['quantity'],
                    previous_stock=previous_stock,
                    new_stock=inventory.current_stock,
                    performed_by_id=request.data.get('created_by_id', 1),
                    notes=f"Order {order.order_number}"
                )
            except InventoryRecord.DoesNotExist:
                pass
        
        return Response(PrescriptionOrderSerializer(order).data, status=status.HTTP_201_CREATED)

class InStoreOrderViewSet(viewsets.ModelViewSet):
    queryset = InStoreOrder.objects.all()
    serializer_class = InStoreOrderSerializer
    
    @transaction.atomic
    def create(self, request):
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        branch_id = request.data.get('branch_id')
        
        total = 0
        for item_data in items_data:
            try:
                product = Medicine.objects.get(id=item_data['product_id'])
                total += product.price * item_data['quantity']
            except Medicine.DoesNotExist:
                return Response({'error': f'Product {item_data["product_id"]} not found'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        order = InStoreOrder.objects.create(
            order_number=f"INS-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer_id=customer_id,
            branch_id=branch_id,
            order_type='in_store',
            total_amount=total,
            created_by_id=request.data.get('created_by_id', 1),
            served_by_id=request.data.get('served_by_id', 1)
        )
        
        # Create items and update inventory
        for item_data in items_data:
            product = Medicine.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
                total_price=product.price * item_data['quantity']
            )
        
        return Response(InStoreOrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OnlineOrderViewSet(viewsets.ModelViewSet):
    queryset = OnlineOrder.objects.all()
    serializer_class = OnlineOrderSerializer
    
    @transaction.atomic
    def create(self, request):
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        branch_id = request.data.get('branch_id')
        
        total = 0
        for item_data in items_data:
            try:
                product = Medicine.objects.get(id=item_data['product_id'])
                total += product.price * item_data['quantity']
            except Medicine.DoesNotExist:
                return Response({'error': f'Product {item_data["product_id"]} not found'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        order = OnlineOrder.objects.create(
            order_number=f"ONL-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer_id=customer_id,
            branch_id=branch_id,
            order_type='online',
            total_amount=total,
            created_by_id=request.data.get('created_by_id', 1),
            delivery_address=request.data.get('delivery_address', '')
        )
        
        # Create items
        for item_data in items_data:
            product = Medicine.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
                total_price=product.price * item_data['quantity']
            )
        
        return Response(OnlineOrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

# ============================================================================
# Prescription ViewSets
# ============================================================================

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    
    @action(detail=True, methods=['post'])
    def validate_prescription(self, request, pk=None):
        """Core business operation: Pharmacist validates prescription"""
        prescription = self.get_object()
        pharmacist_id = request.data.get('pharmacist_id')
        
        # Validation logic as per UML
        prescription.status = 'validated'
        prescription.validated_by_id = pharmacist_id
        prescription.validation_date = timezone.now()
        prescription.validation_notes = request.data.get('notes', '')
        prescription.save()
        
        return Response(self.get_serializer(prescription).data)
    
    @action(detail=True, methods=['post'])
    def dispense_prescription(self, request, pk=None):
        """Core business operation: Dispense validated prescription"""
        prescription = self.get_object()
        
        if prescription.status != 'validated':
            return Response(
                {'error': 'Prescription must be validated before dispensing'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update prescription items with dispensed quantities
        items_data = request.data.get('items', [])
        for item_data in items_data:
            try:
                prescription_item = prescription.items.get(id=item_data['item_id'])
                prescription_item.quantity_dispensed = item_data['quantity_dispensed']
                prescription_item.save()
            except PrescriptionItem.DoesNotExist:
                continue
        
        prescription.status = 'dispensed'
        prescription.save()
        
        return Response(self.get_serializer(prescription).data)

class PrescriptionItemViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer

# ============================================================================
# Delivery ViewSets (Concrete Classes Only)
# ============================================================================

class PickUpDeliveryViewSet(viewsets.ModelViewSet):
    queryset = PickUpDelivery.objects.all()
    serializer_class = PickUpDeliverySerializer
    
    @action(detail=True, methods=['post'])
    def schedule_delivery(self, request, pk=None):
        delivery = self.get_object()
        delivery.scheduled_date = request.data.get('scheduled_date')
        delivery.assigned_staff_id = request.data.get('assigned_staff_id')
        delivery.status = 'scheduled'
        delivery.customer_notified = True
        delivery.save()
        return Response(self.get_serializer(delivery).data)
    
    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        delivery = self.get_object()
        delivery.status = 'delivered'
        delivery.delivered_date = timezone.now()
        delivery.save()
        
        delivery.order.status = 'completed'
        delivery.order.save()
        return Response(self.get_serializer(delivery).data)

class HomeDeliveryViewSet(viewsets.ModelViewSet):
    queryset = HomeDelivery.objects.all()
    serializer_class = HomeDeliverySerializer
    
    @action(detail=True, methods=['post'])
    def schedule_delivery(self, request, pk=None):
        delivery = self.get_object()
        delivery.scheduled_date = request.data.get('scheduled_date')
        delivery.assigned_staff_id = request.data.get('assigned_staff_id')
        delivery.delivery_fee = request.data.get('delivery_fee', 0.00)
        delivery.status = 'scheduled'
        delivery.save()
        return Response(self.get_serializer(delivery).data)
    
    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        delivery = self.get_object()
        delivery.status = 'delivered'
        delivery.delivered_date = timezone.now()
        delivery.save()
        
        delivery.order.status = 'completed'
        delivery.order.save()
        return Response(self.get_serializer(delivery).data)

# ============================================================================
# Factory and Report ViewSets
# ============================================================================

class ProductFactoryViewSet(viewsets.ModelViewSet):
    queryset = ProductFactory.objects.all()
    serializer_class = ProductFactorySerializer

class ReportGeneratorViewSet(viewsets.ModelViewSet):
    queryset = ReportGenerator.objects.all()
    serializer_class = ReportGeneratorSerializer
    
    @action(detail=False, methods=['post'])
    def generate_sales_report(self, request):
        """Core business operation: Generate sales report"""
        branch_id = request.data.get('branch_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        # Query concrete order types instead of abstract Order
        prescription_orders = PrescriptionOrder.objects.filter(
            branch_id=branch_id,
            order_date__date__range=[start_date, end_date],
            status='completed'
        )
        instore_orders = InStoreOrder.objects.filter(
            branch_id=branch_id,
            order_date__date__range=[start_date, end_date],
            status='completed'
        )
        online_orders = OnlineOrder.objects.filter(
            branch_id=branch_id,
            order_date__date__range=[start_date, end_date],
            status='completed'
        )
        
        total_orders = prescription_orders.count() + instore_orders.count() + online_orders.count()
        total_revenue = (
            sum(order.total_amount for order in prescription_orders) +
            sum(order.total_amount for order in instore_orders) +
            sum(order.total_amount for order in online_orders)
        )
        
        report_data = {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'average_order_value': total_revenue / total_orders if total_orders > 0 else 0,
            'orders_by_type': {
                'prescription': prescription_orders.count(),
                'in_store': instore_orders.count(),
                'online': online_orders.count(),
            }
        }
        
        report = ReportGenerator.objects.create(
            report_name=f"Sales Report {start_date} to {end_date}",
            report_type='sales',
            branch_id=branch_id,
            generated_by_id=request.data.get('generated_by_id', 1),
            start_date=start_date,
            end_date=end_date,
            report_data=report_data
        )
        
        return Response(self.get_serializer(report).data)
    
    @action(detail=False, methods=['post'])
    def generate_inventory_report(self, request):
        """Core business operation: Generate inventory report"""
        branch_id = request.data.get('branch_id')
        
        inventory_records = InventoryRecord.objects.filter(branch_id=branch_id)
        
        report_data = {
            'total_products': inventory_records.count(),
            'low_stock_items': inventory_records.filter(current_stock__lte=models.F('reorder_point')).count(),
            'out_of_stock_items': inventory_records.filter(current_stock=0).count(),
            'total_stock_value': sum(
                record.current_stock * record.product.price 
                for record in inventory_records
            ),
            'items_by_category': {}
        }
        
        report = ReportGenerator.objects.create(
            report_name=f"Inventory Report - Branch {branch_id}",
            report_type='inventory',
            branch_id=branch_id,
            generated_by_id=request.data.get('generated_by_id', 1),
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            report_data=report_data
        )
        
        return Response(self.get_serializer(report).data)