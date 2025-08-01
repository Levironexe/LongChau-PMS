# api/views.py - UPDATED FOR UNIFIED USER SYSTEM

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.utils import timezone
from django.db.models import Q, Sum, Count

# Import all models from core app (NEW UNIFIED SYSTEM)
from core.models import (
    PharmacyBranch, BranchConfiguration, InventoryRecord, InventoryTransaction,
    User, UserProfile, LoyaltyPoint,
    Medicine, PrescriptionMedicine, OverTheCounterMedicine, 
    HealthSupplement, MedicalDevice, MedicineDatabase,
    Order, OrderItem, Prescription, PrescriptionItem, Delivery,
    ProductFactory, ReportGenerator
)

# Import serializers
from .serializers import (
    PharmacyBranchSerializer, BranchConfigurationSerializer,
    UserSerializer, UserProfileSerializer, LoyaltyPointSerializer,
    MedicineSerializer, PrescriptionMedicineSerializer, OverTheCounterMedicineSerializer,
    HealthSupplementSerializer, MedicalDeviceSerializer, MedicineDatabaseSerializer,
    InventoryRecordSerializer, InventoryTransactionSerializer,
    OrderSerializer, OrderItemSerializer, PrescriptionSerializer, PrescriptionItemSerializer,
    DeliverySerializer, ReportGeneratorSerializer, ProductFactorySerializer
)

# ============================================================================
# CORE BUSINESS OPERATIONS USING UNIFIED USER SYSTEM
# ============================================================================

class PharmacyBranchViewSet(viewsets.ModelViewSet):
    queryset = PharmacyBranch.objects.all()
    serializer_class = PharmacyBranchSerializer
    
    @action(detail=True, methods=['get'])
    def staff_summary(self, request, pk=None):
        """Get staff summary for a branch using unified User model"""
        branch = self.get_object()
        staff_summary = {}
        
        for role in User.STAFF_ROLES:
            count = branch.users.filter(role=role, is_active=True).count()
            staff_summary[role] = count
        
        return Response(staff_summary)

class BranchConfigurationViewSet(viewsets.ModelViewSet):
    queryset = BranchConfiguration.objects.all()
    serializer_class = BranchConfigurationSerializer

# ============================================================================
# UNIFIED USER SYSTEM API (REPLACES SEPARATE STAFF/CUSTOMER APIS)
# ============================================================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Filter users by role if specified"""
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset
    
    # ========================================================================
    # FACTORY METHOD PATTERN IMPLEMENTATION
    # ========================================================================
    
    @action(detail=False, methods=['post'])
    def create_pharmacist(self, request):
        """Use Factory Method to create pharmacist with proper validation"""
        try:
            pharmacist = User.create_pharmacist(**request.data)
            return Response(UserSerializer(pharmacist).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_customer(self, request):
        """Use Factory Method to create customer with proper defaults"""
        try:
            customer = User.create_customer(**request.data)
            return Response(UserSerializer(customer).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_vip_customer(self, request):
        """Use Factory Method to create VIP customer with benefits"""
        try:
            vip_customer = User.create_vip_customer(**request.data)
            return Response(UserSerializer(vip_customer).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_staff_member(self, request):
        """Use generic Factory Method to create any staff member"""
        role = request.data.get('role')
        try:
            staff_member = User.create_staff_member(role, **request.data)
            return Response(UserSerializer(staff_member).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upgrade_to_vip(self, request, pk=None):
        """Upgrade regular customer to VIP"""
        user = self.get_object()
        if not user.is_customer():
            return Response({'error': 'Only customers can be upgraded to VIP'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update user to VIP using model logic
        user.role = 'vip_customer'
        user.membership_level = request.data.get('membership_level', 'Gold')
        user.discount_rate = request.data.get('discount_rate', 10.00)
        user.membership_start_date = timezone.now().date()
        user.save()
        
        return Response(UserSerializer(user).data)
    
    # Role-based filtering endpoints
    @action(detail=False, methods=['get'])
    def pharmacists(self, request):
        """Get all pharmacists"""
        pharmacists = User.objects.filter(role='pharmacist', is_active=True)
        return Response(UserSerializer(pharmacists, many=True).data)
    
    @action(detail=False, methods=['get'])
    def customers(self, request):
        """Get all customers (regular and VIP)"""
        customers = User.objects.filter(role__in=User.CUSTOMER_ROLES, is_active=True)
        return Response(UserSerializer(customers, many=True).data)
    
    @action(detail=False, methods=['get'])
    def staff(self, request):
        """Get all staff members"""
        staff = User.objects.filter(role__in=User.STAFF_ROLES, is_active=True)
        return Response(UserSerializer(staff, many=True).data)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class LoyaltyPointViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyPoint.objects.all()
    serializer_class = LoyaltyPointSerializer

# ============================================================================
# PRODUCT MANAGEMENT
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
# INVENTORY MANAGEMENT
# ============================================================================

class InventoryRecordViewSet(viewsets.ModelViewSet):
    queryset = InventoryRecord.objects.all()
    serializer_class = InventoryRecordSerializer
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get low stock items"""
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
# ORDER SYSTEM (UNIFIED ORDER MODEL)
# ============================================================================

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        """Filter orders by type if specified"""
        queryset = Order.objects.all()
        order_type = self.request.query_params.get('order_type', None)
        if order_type:
            queryset = queryset.filter(order_type=order_type)
        return queryset
    
    # ========================================================================
    # STATE PATTERN IMPLEMENTATION
    # ========================================================================
    
    @action(detail=True, methods=['post'])
    def transition_status(self, request, pk=None):
        """Use State Pattern to safely transition order status"""
        order = self.get_object()
        new_status = request.data.get('new_status')
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id) if user_id else None
            result = order.transition_to(new_status, user)
            return Response({
                'message': result,
                'order': OrderSerializer(order).data
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def available_transitions(self, request, pk=None):
        """Get available status transitions using State Pattern"""
        order = self.get_object()
        current_state = order.get_state_handler()
        
        if current_state:
            # Check all possible transitions
            possible_statuses = ['pending', 'processing', 'completed', 'cancelled']
            available = [status for status in possible_statuses 
                        if current_state.can_transition_to(status)]
            allowed_actions = current_state.get_allowed_actions(order)
            
            return Response({
                'current_status': order.status,
                'available_transitions': available,
                'allowed_actions': allowed_actions
            })
        
        return Response({'error': 'Invalid order state'}, status=status.HTTP_400_BAD_REQUEST)
    
    # ========================================================================
    # STRATEGY PATTERN IMPLEMENTATION
    # ========================================================================
    
    @action(detail=True, methods=['post'])
    def process_order(self, request, pk=None):
        """Use Strategy Pattern to process order based on type"""
        order = self.get_object()
        
        try:
            result = order.process_order()
            return Response({
                'order': OrderSerializer(order).data,
                'processing_result': result
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def calculate_total_with_strategy(self, request, pk=None):
        """Use Strategy Pattern to calculate total based on order type"""
        order = self.get_object()
        
        try:
            total = order.calculate_total_with_strategy()
            return Response({
                'order_number': order.order_number,
                'order_type': order.order_type,
                'calculated_total': total,
                'current_total': order.total_amount
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @transaction.atomic
    def create(self, request):
        """Create order with unified customer system"""
        customer_id = request.data.get('customer_id')
        items_data = request.data.get('items', [])
        branch_id = request.data.get('branch_id')
        order_type = request.data.get('order_type', 'in_store')
        
        try:
            # Get customer using unified User model
            customer = User.objects.get(id=customer_id, role__in=User.CUSTOMER_ROLES)
            created_by = User.objects.get(id=request.data.get('created_by_id'), 
                                        role__in=User.STAFF_ROLES)
        except User.DoesNotExist:
            return Response({'error': 'Customer or staff member not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total
        total = 0
        for item_data in items_data:
            try:
                product = Medicine.objects.get(id=item_data['product_id'])
                total += product.price * item_data['quantity']
            except Medicine.DoesNotExist:
                return Response({'error': f'Product {item_data["product_id"]} not found'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        # Create order
        order = Order.objects.create(
            order_number=f"{order_type.upper()[:3]}-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer=customer,
            branch_id=branch_id,
            order_type=order_type,
            total_amount=total,
            created_by=created_by,
            delivery_address=request.data.get('delivery_address', ''),
            delivery_instructions=request.data.get('delivery_instructions', '')
        )
        
        # Create order items
        for item_data in items_data:
            product = Medicine.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
                total_price=product.price * item_data['quantity']
            )
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

# ============================================================================
# PRESCRIPTION SYSTEM
# ============================================================================

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    
    @action(detail=True, methods=['post'])
    def validate_prescription(self, request, pk=None):
        """Pharmacist validates prescription using unified User system"""
        prescription = self.get_object()
        pharmacist_id = request.data.get('pharmacist_id')
        
        try:
            pharmacist = User.objects.get(id=pharmacist_id, role='pharmacist')
            if not pharmacist.can_validate_prescription():
                return Response({'error': 'User cannot validate prescriptions'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Pharmacist not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        prescription.status = 'validated'
        prescription.validated_by = pharmacist
        prescription.validation_date = timezone.now()
        prescription.validation_notes = request.data.get('notes', '')
        prescription.save()
        
        return Response(PrescriptionSerializer(prescription).data)

class PrescriptionItemViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer

# ============================================================================
# DELIVERY SYSTEM (UNIFIED DELIVERY MODEL)
# ============================================================================

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    
    @action(detail=True, methods=['post'])
    def schedule_delivery(self, request, pk=None):
        """Schedule delivery with unified staff assignment"""
        delivery = self.get_object()
        staff_id = request.data.get('assigned_staff_id')
        
        try:
            staff_member = User.objects.get(id=staff_id, role__in=User.STAFF_ROLES)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        delivery.scheduled_date = request.data.get('scheduled_date')
        delivery.assigned_staff = staff_member
        delivery.status = 'scheduled'
        delivery.save()
        
        return Response(DeliverySerializer(delivery).data)

# ============================================================================
# FACTORY AND REPORT SYSTEMS
# ============================================================================

class ProductFactoryViewSet(viewsets.ModelViewSet):
    queryset = ProductFactory.objects.all()
    serializer_class = ProductFactorySerializer
    
    # ========================================================================
    # FACTORY PATTERN IMPLEMENTATION
    # ========================================================================
    
    @action(detail=False, methods=['post'])
    def create_medicine(self, request):
        """Use Factory Pattern to create medicine"""
        try:
            medicine = ProductFactory.create_medicine(**request.data)
            return Response(MedicineSerializer(medicine).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_supplement(self, request):
        """Use Factory Pattern to create supplement"""
        try:
            supplement = ProductFactory.create_supplement(**request.data)
            return Response(HealthSupplementSerializer(supplement).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ReportGeneratorViewSet(viewsets.ModelViewSet):
    queryset = ReportGenerator.objects.all()
    serializer_class = ReportGeneratorSerializer
    
    @action(detail=False, methods=['post'])
    def generate_sales_report(self, request):
        """Generate sales report using unified Order model"""
        branch_id = request.data.get('branch_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        generated_by_id = request.data.get('generated_by_id')
        
        try:
            generated_by = User.objects.get(id=generated_by_id, role__in=User.STAFF_ROLES)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Query unified Order model instead of separate order types
        orders = Order.objects.filter(
            branch_id=branch_id,
            order_date__date__range=[start_date, end_date],
            status='completed'
        )
        
        # Aggregate data by order type
        order_summary = orders.values('order_type').annotate(
            count=Count('id'),
            total_revenue=Sum('total_amount')
        )
        
        total_orders = orders.count()
        total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        report_data = {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'average_order_value': float(total_revenue / total_orders) if total_orders > 0 else 0,
            'orders_by_type': {item['order_type']: {
                'count': item['count'],
                'revenue': float(item['total_revenue'] or 0)
            } for item in order_summary},
            'period': f"{start_date} to {end_date}"
        }
        
        report = ReportGenerator.objects.create(
            report_name=f"Sales Report {start_date} to {end_date}",
            report_type='sales',
            branch_id=branch_id,
            generated_by=generated_by,
            start_date=start_date,
            end_date=end_date,
            report_data=report_data
        )
        
        return Response(ReportGeneratorSerializer(report).data)
    
    @action(detail=False, methods=['post'])
    def generate_staff_performance_report(self, request):
        """Generate staff performance report using unified User model"""
        branch_id = request.data.get('branch_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        generated_by_id = request.data.get('generated_by_id')
        
        try:
            generated_by = User.objects.get(id=generated_by_id, role__in=User.STAFF_ROLES)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get staff performance data using unified User model
        staff_performance = {}
        
        for role in User.STAFF_ROLES:
            staff_members = User.objects.filter(
                role=role, 
                branch_id=branch_id, 
                is_active=True
            )
            
            role_data = []
            for staff in staff_members:
                # Get orders created by this staff member
                orders_created = Order.objects.filter(
                    created_by=staff,
                    order_date__date__range=[start_date, end_date]
                ).count()
                
                # Get prescriptions validated (for pharmacists)
                prescriptions_validated = 0
                if staff.role == 'pharmacist':
                    prescriptions_validated = Prescription.objects.filter(
                        validated_by=staff,
                        validation_date__date__range=[start_date, end_date]
                    ).count()
                
                role_data.append({
                    'staff_id': staff.user_id,
                    'name': staff.get_display_name(),
                    'orders_created': orders_created,
                    'prescriptions_validated': prescriptions_validated
                })
            
            staff_performance[role] = role_data
        
        report_data = {
            'staff_performance': staff_performance,
            'total_staff': User.objects.filter(
                role__in=User.STAFF_ROLES, 
                branch_id=branch_id, 
                is_active=True
            ).count(),
            'period': f"{start_date} to {end_date}"
        }
        
        report = ReportGenerator.objects.create(
            report_name=f"Staff Performance Report {start_date} to {end_date}",
            report_type='staff_performance',
            branch_id=branch_id,
            generated_by=generated_by,
            start_date=start_date,
            end_date=end_date,
            report_data=report_data
        )
        
        return Response(ReportGeneratorSerializer(report).data)
    
    @action(detail=False, methods=['post'])
    def generate_inventory_report(self, request):
        """Generate inventory report"""
        branch_id = request.data.get('branch_id')
        generated_by_id = request.data.get('generated_by_id')
        
        try:
            generated_by = User.objects.get(id=generated_by_id, role__in=User.STAFF_ROLES)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        inventory_records = InventoryRecord.objects.filter(branch_id=branch_id)
        
        low_stock_items = inventory_records.filter(
            current_stock__lte=models.F('reorder_point')
        )
        out_of_stock_items = inventory_records.filter(current_stock=0)
        
        total_stock_value = sum(
            record.current_stock * record.product.price 
            for record in inventory_records
        )
        
        report_data = {
            'total_products': inventory_records.count(),
            'low_stock_items': low_stock_items.count(),
            'out_of_stock_items': out_of_stock_items.count(),
            'total_stock_value': float(total_stock_value),
            'low_stock_details': [
                {
                    'product_name': item.product.name,
                    'current_stock': item.current_stock,
                    'reorder_point': item.reorder_point
                }
                for item in low_stock_items
            ]
        }
        
        report = ReportGenerator.objects.create(
            report_name=f"Inventory Report - Branch {branch_id}",
            report_type='inventory',
            branch_id=branch_id,
            generated_by=generated_by,
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            report_data=report_data
        )
        
        return Response(ReportGeneratorSerializer(report).data)