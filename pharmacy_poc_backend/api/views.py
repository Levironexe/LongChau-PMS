# api/views.py - UPDATED WITH WAREHOUSE SYSTEM + USER ACCOUNTS

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.utils import timezone
from django.db.models import Q, Sum, Count, F

# Import all models from core app (ENHANCED WITH WAREHOUSE)
from core.models import (
    PharmacyBranch, BranchConfiguration, InventoryRecord, InventoryTransaction,
    User, UserProfile, LoyaltyPoint, UserAccount,
    Warehouse, WarehouseInventoryRecord, WarehouseInventoryTransaction, InventoryTransfer,
    Medicine, PrescriptionMedicine, OverTheCounterMedicine, 
    HealthSupplement, MedicalDevice, MedicineDatabase,
    Order, OrderItem, Prescription, PrescriptionItem, Delivery,
    ProductFactory, ReportGenerator
)

# Import serializers (ENHANCED)
from .serializers import (
    PharmacyBranchSerializer, BranchConfigurationSerializer,
    UserSerializer, UserProfileSerializer, LoyaltyPointSerializer,
    UserAccountSerializer, LoginSerializer, RegisterUserSerializer, ChangePasswordSerializer,
    WarehouseSerializer, WarehouseInventoryRecordSerializer, WarehouseInventoryTransactionSerializer,
    InventoryTransferSerializer, WarehouseStockAddSerializer, TransferRequestSerializer,
    TransferApprovalSerializer, TransferCompletionSerializer,
    MedicineSerializer, PrescriptionMedicineSerializer, OverTheCounterMedicineSerializer,
    HealthSupplementSerializer, MedicalDeviceSerializer, MedicineDatabaseSerializer,
    InventoryRecordSerializer, InventoryTransactionSerializer,
    OrderSerializer, OrderItemSerializer, PrescriptionSerializer, PrescriptionItemSerializer,
    DeliverySerializer, ReportGeneratorSerializer, ProductFactorySerializer,
    BranchInventoryStatusSerializer, WarehouseInventoryStatusSerializer
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
    
    @action(detail=True, methods=['get'])
    def inventory_overview(self, request, pk=None):
        """Get comprehensive inventory overview for a branch"""
        branch = self.get_object()
        
        # Get branch inventory
        inventory_records = InventoryRecord.objects.filter(branch=branch)
        low_stock = inventory_records.filter(current_stock__lte=F('reorder_point'))
        out_of_stock = inventory_records.filter(current_stock=0)
        
        # Get pending transfers
        pending_transfers = InventoryTransfer.objects.filter(
            destination_branch=branch,
            status__in=['pending', 'approved', 'in_transit']
        )
        
        return Response({
            'branch': {
                'id': branch.id,
                'name': branch.name
            },
            'inventory_summary': {
                'total_products': inventory_records.count(),
                'low_stock_count': low_stock.count(),
                'out_of_stock_count': out_of_stock.count(),
                'total_value': sum(r.current_stock * r.product.price for r in inventory_records)
            },
            'pending_transfers': pending_transfers.count()
        })

class BranchConfigurationViewSet(viewsets.ModelViewSet):
    queryset = BranchConfiguration.objects.all()
    serializer_class = BranchConfigurationSerializer

# ============================================================================
# WAREHOUSE SYSTEM API (NEW)
# ============================================================================

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    
    @action(detail=True, methods=['get'])
    def inventory_status(self, request, pk=None):
        """Get comprehensive warehouse inventory status"""
        warehouse = self.get_object()
        
        # Get warehouse inventory
        inventory_records = WarehouseInventoryRecord.objects.filter(warehouse=warehouse)
        low_stock = inventory_records.filter(current_stock__lte=F('reorder_point'))
        
        # Get recent transactions
        recent_transactions = WarehouseInventoryTransaction.objects.filter(
            warehouse_record__warehouse=warehouse
        ).order_by('-transaction_date')[:10]
        
        # Get pending transfers from this warehouse
        pending_transfers = InventoryTransfer.objects.filter(
            source_warehouse=warehouse,
            status__in=['pending', 'approved', 'in_transit']
        )
        
        total_value = sum(
            record.current_stock * record.cost_price 
            for record in inventory_records
        )
        
        response_data = {
            'warehouse': {
                'id': warehouse.id,
                'name': warehouse.name,
                'manager': warehouse.manager.get_display_name() if warehouse.manager else None,
                'total_stock': warehouse.get_total_stock(),
                'utilization_percentage': warehouse.get_utilization_percentage()
            },
            'inventory_summary': {
                'total_products': inventory_records.count(),
                'low_stock_count': low_stock.count(),
                'total_value': total_value
            },
            'low_stock_items': [
                {
                    'product_name': item.product.name,
                    'current_stock': item.current_stock,
                    'reorder_point': item.reorder_point,
                    'cost_price': item.cost_price
                }
                for item in low_stock
            ],
            'recent_transactions': [
                {
                    'type': txn.transaction_type,
                    'product_name': txn.warehouse_record.product.name,
                    'quantity': txn.quantity,
                    'date': txn.transaction_date,
                    'performed_by': txn.performed_by.get_display_name()
                }
                for txn in recent_transactions
            ],
            'pending_transfers': pending_transfers.count()
        }
        
        serializer = WarehouseInventoryStatusSerializer(response_data)
        return Response(serializer.data)

class WarehouseInventoryRecordViewSet(viewsets.ModelViewSet):
    queryset = WarehouseInventoryRecord.objects.all()
    serializer_class = WarehouseInventoryRecordSerializer
    
    def get_queryset(self):
        queryset = WarehouseInventoryRecord.objects.all()
        warehouse_id = self.request.query_params.get('warehouse_id')
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def add_stock(self, request):
        """Add stock to warehouse from suppliers"""
        serializer = WarehouseStockAddSerializer(data=request.data)
        if serializer.is_valid():
            try:
                warehouse = Warehouse.objects.get(id=serializer.validated_data['warehouse_id'])
                product = Medicine.objects.get(id=serializer.validated_data['product_id'])
                performed_by = User.objects.get(
                    id=serializer.validated_data['performed_by_id'],
                    role__in=User.STAFF_ROLES
                )
                
                # Use the service to add stock
                from core.models import WarehouseManagementService
                record = WarehouseManagementService.add_warehouse_stock(
                    warehouse=warehouse,
                    product=product,
                    quantity=serializer.validated_data['quantity'],
                    cost_price=serializer.validated_data['cost_price'],
                    performed_by=performed_by,
                    **{k: v for k, v in serializer.validated_data.items() 
                       if k in ['supplier', 'purchase_order_number', 'supplier_reference', 'notes']}
                )
                
                return Response({
                    'success': True,
                    'message': f'Added {serializer.validated_data["quantity"]} units to warehouse',
                    'record': WarehouseInventoryRecordSerializer(record).data
                })
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get low stock items in warehouse"""
        warehouse_id = request.query_params.get('warehouse_id')
        queryset = self.get_queryset()
        
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        
        low_stock_items = queryset.filter(current_stock__lte=F('reorder_point'))
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

class WarehouseInventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = WarehouseInventoryTransaction.objects.all()
    serializer_class = WarehouseInventoryTransactionSerializer
    
    def get_queryset(self):
        queryset = WarehouseInventoryTransaction.objects.all()
        warehouse_id = self.request.query_params.get('warehouse_id')
        if warehouse_id:
            queryset = queryset.filter(warehouse_record__warehouse_id=warehouse_id)
        return queryset.order_by('-transaction_date')

class InventoryTransferViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransfer.objects.all()
    serializer_class = InventoryTransferSerializer
    
    def get_queryset(self):
        queryset = InventoryTransfer.objects.all()
        branch_id = self.request.query_params.get('branch_id')
        warehouse_id = self.request.query_params.get('warehouse_id')
        status_filter = self.request.query_params.get('status')
        
        if branch_id:
            queryset = queryset.filter(destination_branch_id=branch_id)
        if warehouse_id:
            queryset = queryset.filter(source_warehouse_id=warehouse_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-request_date')
    
    @action(detail=False, methods=['post'])
    def request_transfer(self, request):
        """Request stock transfer from warehouse to branch"""
        serializer = TransferRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                branch = PharmacyBranch.objects.get(id=serializer.validated_data['branch_id'])
                product = Medicine.objects.get(id=serializer.validated_data['product_id'])
                requested_by = User.objects.get(
                    id=serializer.validated_data['requested_by_id'],
                    role__in=['manager', 'inventory_manager']
                )
                
                # Use the service to request transfer
                from core.models import WarehouseManagementService
                transfer = WarehouseManagementService.request_stock_transfer(
                    branch=branch,
                    product=product,
                    quantity=serializer.validated_data['quantity'],
                    requested_by=requested_by,
                    warehouse=Warehouse.objects.get(id=serializer.validated_data['warehouse_id']) if serializer.validated_data.get('warehouse_id') else None,
                    notes=serializer.validated_data.get('notes', '')
                )
                
                return Response({
                    'success': True,
                    'transfer': InventoryTransferSerializer(transfer).data
                })
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def approve_transfer(self, request, pk=None):
        """Approve transfer request"""
        transfer = self.get_object()
        serializer = TransferApprovalSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                approver = User.objects.get(
                    id=serializer.validated_data['approver_id'],
                    role='inventory_manager'
                )
                
                transfer.approve(approver)
                
                return Response({
                    'success': True,
                    'message': f'Transfer {transfer.transfer_number} approved',
                    'transfer': InventoryTransferSerializer(transfer).data
                })
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete_transfer(self, request, pk=None):
        """Complete approved transfer"""
        transfer = self.get_object()
        serializer = TransferCompletionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                receiving_user = User.objects.get(
                    id=serializer.validated_data['receiving_user_id'],
                    role__in=User.STAFF_ROLES
                )
                
                transfer.complete_transfer(receiving_user)
                
                return Response({
                    'success': True,
                    'message': f'Transfer {transfer.transfer_number} completed',
                    'transfer': InventoryTransferSerializer(transfer).data
                })
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending_transfers(self, request):
        """Get all pending transfer requests"""
        pending = InventoryTransfer.objects.filter(status='pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

# ============================================================================
# USER AUTHENTICATION API (NEW)
# ============================================================================

class UserAccountViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login with username/password"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            account, message = UserAccount.authenticate(username, password)
            
            if account and account.user_profile:
                user = account.user_profile
                return Response({
                    'success': True,
                    'message': message,
                    'user': {
                        'id': user.id,
                        'username': account.username,
                        'name': user.get_display_name(),
                        'role': user.role,
                        'branch_id': user.branch.id,
                        'branch_name': user.branch.name,
                        'permissions': {
                            'can_validate_prescriptions': user.can_validate_prescription(),
                            'can_approve_orders': user.can_manage_inventory(),
                            'is_staff': user.is_staff(),
                            'is_customer': user.is_customer()
                        }
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': message
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register new user account"""
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(id=serializer.validated_data['user_id'])
                
                # Check if user already has an account
                if hasattr(user, 'account'):
                    return Response({
                        'error': 'User already has an account'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create account
                account = UserAccount.objects.create(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    user_profile=user
                )
                account.set_password(serializer.validated_data['password'])
                account.save()
                
                return Response({
                    'success': True,
                    'message': 'Account created successfully',
                    'account': UserAccountSerializer(account).data
                })
                
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                account = UserAccount.objects.get(
                    username=serializer.validated_data['username']
                )
                
                if not account.check_password(serializer.validated_data['old_password']):
                    return Response({
                        'error': 'Invalid current password'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                account.set_password(serializer.validated_data['new_password'])
                account.save()
                
                return Response({
                    'success': True,
                    'message': 'Password changed successfully'
                })
                
            except UserAccount.DoesNotExist:
                return Response({
                    'error': 'Account not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# UNIFIED USER SYSTEM API (ENHANCED)
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
# PRODUCT MANAGEMENT (ENHANCED)
# ============================================================================

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['branch_id'] = self.request.query_params.get('branch_id')
        return context

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

class MedicineDatabaseViewSet(viewsets.ModelViewSet):
    queryset = MedicineDatabase.objects.all()
    serializer_class = MedicineDatabaseSerializer

# ============================================================================
# INVENTORY MANAGEMENT (ENHANCED WITH WAREHOUSE INFO)
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
    
    @action(detail=False, methods=['get'])
    def branch_status(self, request):
        """Get comprehensive branch inventory status"""
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response({'error': 'branch_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            branch = PharmacyBranch.objects.get(id=branch_id)
            
            # Get branch inventory
            inventory_records = InventoryRecord.objects.filter(branch=branch)
            low_stock = inventory_records.filter(current_stock__lte=F('reorder_point'))
            out_of_stock = inventory_records.filter(current_stock=0)
            
            # Get pending transfers
            pending_transfers = InventoryTransfer.objects.filter(
                destination_branch=branch,
                status__in=['pending', 'approved', 'in_transit']
            )
            
            # Get warehouse availability summary
            warehouse_availability = {}
            for record in low_stock:
                warehouse_records = WarehouseInventoryRecord.objects.filter(
                    product=record.product
                )
                total_warehouse_stock = sum(wr.current_stock for wr in warehouse_records)
                warehouse_availability[record.product.name] = {
                    'needed': record.minimum_stock - record.current_stock,
                    'warehouse_available': total_warehouse_stock,
                    'can_restock': total_warehouse_stock >= (record.minimum_stock - record.current_stock)
                }
            
            response_data = {
                'branch': {
                    'id': branch.id,
                    'name': branch.name
                },
                'inventory_summary': {
                    'total_products': inventory_records.count(),
                    'low_stock_count': low_stock.count(),
                    'out_of_stock_count': out_of_stock.count(),
                    'adequate_stock_count': inventory_records.exclude(
                        current_stock__lte=F('reorder_point')
                    ).count()
                },
                'low_stock_items': [
                    {
                        'product_name': item.product.name,
                        'current_stock': item.current_stock,
                        'reorder_point': item.reorder_point,
                        'minimum_stock': item.minimum_stock
                    }
                    for item in low_stock
                ],
                'out_of_stock_items': [
                    {
                        'product_name': item.product.name,
                        'reorder_point': item.reorder_point
                    }
                    for item in out_of_stock
                ],
                'pending_transfers': [
                    {
                        'transfer_number': transfer.transfer_number,
                        'product_name': transfer.product.name,
                        'quantity': transfer.quantity,
                        'status': transfer.status,
                        'request_date': transfer.request_date
                    }
                    for transfer in pending_transfers
                ],
                'warehouse_availability': warehouse_availability
            }
            
            serializer = BranchInventoryStatusSerializer(response_data)
            return Response(serializer.data)
            
        except PharmacyBranch.DoesNotExist:
            return Response({'error': 'Branch not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer

# ============================================================================
# ORDER SYSTEM (UNIFIED ORDER MODEL) - ENHANCED
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
# FACTORY AND REPORT SYSTEMS (ENHANCED)
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
    def generate_warehouse_report(self, request):
        """Generate warehouse report (NEW)"""
        warehouse_id = request.data.get('warehouse_id')
        generated_by_id = request.data.get('generated_by_id')
        
        try:
            generated_by = User.objects.get(id=generated_by_id, role__in=User.STAFF_ROLES)
            warehouse = Warehouse.objects.get(id=warehouse_id) if warehouse_id else None
        except (User.DoesNotExist, Warehouse.DoesNotExist):
            return Response({'error': 'User or warehouse not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if warehouse:
            # Single warehouse report
            inventory_records = WarehouseInventoryRecord.objects.filter(warehouse=warehouse)
            low_stock = inventory_records.filter(current_stock__lte=F('reorder_point'))
            
            # Get recent transfers
            recent_transfers = InventoryTransfer.objects.filter(
                source_warehouse=warehouse
            ).order_by('-request_date')[:30]
            
            report_data = {
                'warehouse_id': warehouse.id,
                'warehouse_name': warehouse.name,
                'total_products': inventory_records.count(),
                'low_stock_items': low_stock.count(),
                'total_stock_value': sum(r.current_stock * r.cost_price for r in inventory_records),
                'utilization_percentage': warehouse.get_utilization_percentage(),
                'recent_transfers': recent_transfers.count()
            }
        else:
            # System-wide warehouse report
            all_warehouses = Warehouse.objects.all()
            total_transfers = InventoryTransfer.objects.all().count()
            
            report_data = {
                'total_warehouses': all_warehouses.count(),
                'total_warehouse_stock': sum(w.get_total_stock() for w in all_warehouses),
                'total_transfers': total_transfers,
                'warehouses_detail': [
                    {
                        'name': w.name,
                        'total_stock': w.get_total_stock(),
                        'utilization': w.get_utilization_percentage()
                    }
                    for w in all_warehouses
                ]
            }
        
        report = ReportGenerator.objects.create(
            report_name=f"Warehouse Report - {warehouse.name if warehouse else 'System Wide'}",
            report_type='warehouse',
            branch_id=1,  # Default branch for system reports
            generated_by=generated_by,
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
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