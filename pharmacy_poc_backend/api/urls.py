# api/urls.py - UPDATED WITH WAREHOUSE SYSTEM + USER ACCOUNTS

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 

router = DefaultRouter()

# ============================================================================
# BRANCH AND CONFIGURATION ENDPOINTS
# ============================================================================
router.register(r'branches', views.PharmacyBranchViewSet)
router.register(r'branch-configs', views.BranchConfigurationViewSet)

# ============================================================================
# WAREHOUSE SYSTEM ENDPOINTS (NEW)
# ============================================================================
router.register(r'warehouses', views.WarehouseViewSet)
router.register(r'warehouse-inventory', views.WarehouseInventoryRecordViewSet)
router.register(r'warehouse-transactions', views.WarehouseInventoryTransactionViewSet)
router.register(r'inventory-transfers', views.InventoryTransferViewSet)

# ============================================================================
# UNIFIED USER SYSTEM ENDPOINTS + AUTHENTICATION
# ============================================================================
router.register(r'users', views.UserViewSet)
router.register(r'user-profiles', views.UserProfileViewSet)
router.register(r'loyalty-points', views.LoyaltyPointViewSet)
router.register(r'user-accounts', views.UserAccountViewSet)

# ============================================================================
# PRODUCT MANAGEMENT ENDPOINTS
# ============================================================================
router.register(r'medicines', views.MedicineViewSet)
router.register(r'prescription-medicines', views.PrescriptionMedicineViewSet)
router.register(r'otc-medicines', views.OverTheCounterMedicineViewSet)
router.register(r'supplements', views.HealthSupplementViewSet)
router.register(r'medical-devices', views.MedicalDeviceViewSet)
router.register(r'medicine-database', views.MedicineDatabaseViewSet)

# ============================================================================
# INVENTORY MANAGEMENT ENDPOINTS (BRANCH LEVEL)
# ============================================================================
router.register(r'inventory-records', views.InventoryRecordViewSet)
router.register(r'inventory-transactions', views.InventoryTransactionViewSet)

# ============================================================================
# ORDER SYSTEM ENDPOINTS (UNIFIED ORDER MODEL)
# ============================================================================
router.register(r'orders', views.OrderViewSet)
router.register(r'order-items', views.OrderItemViewSet)

# ============================================================================
# PRESCRIPTION SYSTEM ENDPOINTS
# ============================================================================
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'prescription-items', views.PrescriptionItemViewSet)

# ============================================================================
# DELIVERY SYSTEM ENDPOINTS (UNIFIED DELIVERY MODEL)
# ============================================================================
router.register(r'deliveries', views.DeliveryViewSet)

# ============================================================================
# FACTORY AND REPORT ENDPOINTS
# ============================================================================
router.register(r'product-factories', views.ProductFactoryViewSet)
router.register(r'reports', views.ReportGeneratorViewSet)

# ============================================================================
# CUSTOM URL PATTERNS FOR DESIGN PATTERNS + WAREHOUSE OPERATIONS
# ============================================================================

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # ========================================================================
    # AUTHENTICATION ENDPOINTS (NEW)
    # ========================================================================
    path('auth/login/', views.UserAccountViewSet.as_view({'post': 'login'}), 
         name='auth-login'),
    path('auth/register/', views.UserAccountViewSet.as_view({'post': 'register'}), 
         name='auth-register'),
    path('auth/change-password/', views.UserAccountViewSet.as_view({'post': 'change_password'}), 
         name='auth-change-password'),
    
    # ========================================================================
    # WAREHOUSE MANAGEMENT ENDPOINTS (NEW)
    # ========================================================================
    path('warehouses/<int:pk>/inventory-status/', 
         views.WarehouseViewSet.as_view({'get': 'inventory_status'}), 
         name='warehouse-inventory-status'),
    path('warehouse-inventory/add-stock/', 
         views.WarehouseInventoryRecordViewSet.as_view({'post': 'add_stock'}), 
         name='warehouse-add-stock'),
    path('warehouse-inventory/low-stock/', 
         views.WarehouseInventoryRecordViewSet.as_view({'get': 'low_stock'}), 
         name='warehouse-low-stock'),
    
    # ========================================================================
    # INVENTORY TRANSFER ENDPOINTS (NEW)
    # ========================================================================
    path('transfers/request/', 
         views.InventoryTransferViewSet.as_view({'post': 'request_transfer'}), 
         name='request-transfer'),
    path('transfers/<int:pk>/approve/', 
         views.InventoryTransferViewSet.as_view({'post': 'approve_transfer'}), 
         name='approve-transfer'),
    path('transfers/<int:pk>/complete/', 
         views.InventoryTransferViewSet.as_view({'post': 'complete_transfer'}), 
         name='complete-transfer'),
    path('transfers/pending/', 
         views.InventoryTransferViewSet.as_view({'get': 'pending_transfers'}), 
         name='pending-transfers'),
    
    # ========================================================================
    # FACTORY METHOD PATTERN ENDPOINTS
    # ========================================================================
    path('users/create-pharmacist/', views.UserViewSet.as_view({'post': 'create_pharmacist'}), 
         name='create-pharmacist'),
    path('users/create-customer/', views.UserViewSet.as_view({'post': 'create_customer'}), 
         name='create-customer'),
    path('users/create-vip-customer/', views.UserViewSet.as_view({'post': 'create_vip_customer'}), 
         name='create-vip-customer'),
    path('users/create-staff/', views.UserViewSet.as_view({'post': 'create_staff_member'}), 
         name='create-staff-member'),
    
    # ========================================================================
    # ROLE-BASED USER FILTERING ENDPOINTS
    # ========================================================================
    path('users/pharmacists/', views.UserViewSet.as_view({'get': 'pharmacists'}), 
         name='list-pharmacists'),
    path('users/customers/', views.UserViewSet.as_view({'get': 'customers'}), 
         name='list-customers'),
    path('users/staff/', views.UserViewSet.as_view({'get': 'staff'}), 
         name='list-staff'),
    
    # ========================================================================
    # STATE PATTERN ENDPOINTS FOR ORDER MANAGEMENT
    # ========================================================================
    path('orders/<int:pk>/transition/', views.OrderViewSet.as_view({'post': 'transition_status'}), 
         name='order-transition'),
    path('orders/<int:pk>/available-transitions/', views.OrderViewSet.as_view({'get': 'available_transitions'}), 
         name='order-available-transitions'),
    
    # ========================================================================
    # STRATEGY PATTERN ENDPOINTS FOR ORDER PROCESSING
    # ========================================================================
    path('orders/<int:pk>/process/', views.OrderViewSet.as_view({'post': 'process_order'}), 
         name='order-process'),
    path('orders/<int:pk>/calculate-total/', views.OrderViewSet.as_view({'get': 'calculate_total_with_strategy'}), 
         name='order-calculate-total'),
    
    # ========================================================================
    # FACTORY PATTERN ENDPOINTS FOR PRODUCT CREATION
    # ========================================================================
    path('factory/create-medicine/', views.ProductFactoryViewSet.as_view({'post': 'create_medicine'}), 
         name='factory-create-medicine'),
    path('factory/create-supplement/', views.ProductFactoryViewSet.as_view({'post': 'create_supplement'}), 
         name='factory-create-supplement'),
    
    # ========================================================================
    # BUSINESS OPERATION ENDPOINTS
    # ========================================================================
    path('prescriptions/<int:pk>/validate/', views.PrescriptionViewSet.as_view({'post': 'validate_prescription'}), 
         name='validate-prescription'),
    path('deliveries/<int:pk>/schedule/', views.DeliveryViewSet.as_view({'post': 'schedule_delivery'}), 
         name='schedule-delivery'),
    
    # ========================================================================
    # REPORT GENERATION ENDPOINTS
    # ========================================================================
    path('reports/sales/', views.ReportGeneratorViewSet.as_view({'post': 'generate_sales_report'}), 
         name='generate-sales-report'),
    path('reports/staff-performance/', views.ReportGeneratorViewSet.as_view({'post': 'generate_staff_performance_report'}), 
         name='generate-staff-performance-report'),
    path('reports/inventory/', views.ReportGeneratorViewSet.as_view({'post': 'generate_inventory_report'}), 
         name='generate-inventory-report'),
    path('reports/warehouse/', views.ReportGeneratorViewSet.as_view({'post': 'generate_warehouse_report'}), 
         name='generate-warehouse-report'),
    
    # ========================================================================
    # INVENTORY MANAGEMENT ENDPOINTS
    # ========================================================================
    path('inventory/low-stock/', views.InventoryRecordViewSet.as_view({'get': 'low_stock'}), 
         name='inventory-low-stock'),
    path('inventory/branch-status/', views.InventoryRecordViewSet.as_view({'get': 'branch_status'}), 
         name='inventory-branch-status'),
]

"""
COMPLETE API ENDPOINT SUMMARY WITH WAREHOUSE SYSTEM:

========================================================================
NEW WAREHOUSE & AUTHENTICATION ENDPOINTS:
========================================================================

WAREHOUSE MANAGEMENT:
- GET/POST /api/warehouses/ - Manage warehouses
- GET /api/warehouses/{id}/inventory-status/ - Warehouse inventory overview
- GET/POST /api/warehouse-inventory/ - Warehouse stock records
- POST /api/warehouse-inventory/add-stock/ - Add stock to warehouse
- GET /api/warehouse-inventory/low-stock/ - Low warehouse stock items
- GET/POST /api/warehouse-transactions/ - Warehouse transaction history

INVENTORY TRANSFERS (Warehouse → Branch):
- GET/POST /api/inventory-transfers/ - All transfer records
- POST /api/transfers/request/ - Request warehouse→branch transfer
- POST /api/transfers/{id}/approve/ - Approve transfer request
- POST /api/transfers/{id}/complete/ - Complete approved transfer
- GET /api/transfers/pending/ - Get pending transfer requests

USER AUTHENTICATION:
- GET/POST /api/user-accounts/ - User account management
- POST /api/auth/login/ - User login with username/password
- POST /api/auth/register/ - Register new user account
- POST /api/auth/change-password/ - Change user password

========================================================================
EXISTING ENDPOINTS (Enhanced):
========================================================================

UNIFIED USER SYSTEM:
- GET/POST /api/users/ - Manage all users (staff and customers)
- POST /api/users/create-pharmacist/ - Factory Method for pharmacists
- POST /api/users/create-customer/ - Factory Method for customers
- POST /api/users/create-vip-customer/ - Factory Method for VIP customers
- GET /api/users/pharmacists/ - Get pharmacists only
- GET /api/users/customers/ - Get customers only
- GET /api/users/staff/ - Get all staff members

ORDER MANAGEMENT WITH DESIGN PATTERNS:
- GET/POST /api/orders/ - Manage unified orders
- POST /api/orders/{id}/transition/ - State Pattern status transitions
- GET /api/orders/{id}/available-transitions/ - State Pattern available moves
- POST /api/orders/{id}/process/ - Strategy Pattern processing
- GET /api/orders/{id}/calculate-total/ - Strategy Pattern calculations

BUSINESS OPERATIONS:
- POST /api/prescriptions/{id}/validate/ - Pharmacist validates prescription
- POST /api/deliveries/{id}/schedule/ - Schedule delivery with staff assignment
- GET /api/inventory/low-stock/ - Get low stock items (branch level)
- GET /api/inventory/branch-status/ - Complete branch inventory status

COMPREHENSIVE REPORTING:
- POST /api/reports/sales/ - Generate sales reports
- POST /api/reports/staff-performance/ - Generate staff performance reports
- POST /api/reports/inventory/ - Generate branch inventory reports
- POST /api/reports/warehouse/ - Generate warehouse reports (NEW)

========================================================================
COMPLETE 3-LEVEL INVENTORY SYSTEM:
========================================================================
Supplier → Warehouse → Branch → Customer

1. Add stock to warehouse: POST /api/warehouse-inventory/add-stock/
2. Request transfer: POST /api/transfers/request/
3. Approve transfer: POST /api/transfers/{id}/approve/
4. Complete transfer: POST /api/transfers/{id}/complete/
5. Branch serves customer: POST /api/orders/ (with automatic inventory reduction)

This system now supports:
✅ Complete warehouse management
✅ 3-level inventory tracking
✅ User authentication system
✅ Automated transfer workflows
✅ Design patterns implementation
✅ Comprehensive reporting
"""