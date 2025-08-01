# api/urls.py - UPDATED FOR UNIFIED USER SYSTEM

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
# UNIFIED USER SYSTEM ENDPOINTS (REPLACES SEPARATE STAFF/CUSTOMER ENDPOINTS)
# ============================================================================
router.register(r'users', views.UserViewSet)
router.register(r'user-profiles', views.UserProfileViewSet)
router.register(r'loyalty-points', views.LoyaltyPointViewSet)

# ============================================================================
# PRODUCT MANAGEMENT ENDPOINTS
# ============================================================================
router.register(r'medicines', views.MedicineViewSet)
router.register(r'prescription-medicines', views.PrescriptionMedicineViewSet)
router.register(r'otc-medicines', views.OverTheCounterMedicineViewSet)
router.register(r'supplements', views.HealthSupplementViewSet)
router.register(r'medical-devices', views.MedicalDeviceViewSet)

# ============================================================================
# INVENTORY MANAGEMENT ENDPOINTS
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
# CUSTOM URL PATTERNS FOR DESIGN PATTERNS DEMONSTRATION
# ============================================================================

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # Factory Method Pattern endpoints
    path('users/create-pharmacist/', views.UserViewSet.as_view({'post': 'create_pharmacist'}), 
         name='create-pharmacist'),
    path('users/create-customer/', views.UserViewSet.as_view({'post': 'create_customer'}), 
         name='create-customer'),
    path('users/create-vip-customer/', views.UserViewSet.as_view({'post': 'create_vip_customer'}), 
         name='create-vip-customer'),
    path('users/create-staff/', views.UserViewSet.as_view({'post': 'create_staff_member'}), 
         name='create-staff-member'),
    
    # Role-based user filtering endpoints
    path('users/pharmacists/', views.UserViewSet.as_view({'get': 'pharmacists'}), 
         name='list-pharmacists'),
    path('users/customers/', views.UserViewSet.as_view({'get': 'customers'}), 
         name='list-customers'),
    path('users/staff/', views.UserViewSet.as_view({'get': 'staff'}), 
         name='list-staff'),
    
    # State Pattern endpoints for order management
    path('orders/<int:pk>/transition/', views.OrderViewSet.as_view({'post': 'transition_status'}), 
         name='order-transition'),
    path('orders/<int:pk>/available-transitions/', views.OrderViewSet.as_view({'get': 'available_transitions'}), 
         name='order-available-transitions'),
    
    # Strategy Pattern endpoints for order processing
    path('orders/<int:pk>/process/', views.OrderViewSet.as_view({'post': 'process_order'}), 
         name='order-process'),
    path('orders/<int:pk>/calculate-total/', views.OrderViewSet.as_view({'get': 'calculate_total_with_strategy'}), 
         name='order-calculate-total'),
    
    # Factory Pattern endpoints for product creation
    path('factory/create-medicine/', views.ProductFactoryViewSet.as_view({'post': 'create_medicine'}), 
         name='factory-create-medicine'),
    path('factory/create-supplement/', views.ProductFactoryViewSet.as_view({'post': 'create_supplement'}), 
         name='factory-create-supplement'),
    
    # Business operation endpoints
    path('prescriptions/<int:pk>/validate/', views.PrescriptionViewSet.as_view({'post': 'validate_prescription'}), 
         name='validate-prescription'),
    path('deliveries/<int:pk>/schedule/', views.DeliveryViewSet.as_view({'post': 'schedule_delivery'}), 
         name='schedule-delivery'),
    
    # Report generation endpoints
    path('reports/sales/', views.ReportGeneratorViewSet.as_view({'post': 'generate_sales_report'}), 
         name='generate-sales-report'),
    path('reports/staff-performance/', views.ReportGeneratorViewSet.as_view({'post': 'generate_staff_performance_report'}), 
         name='generate-staff-performance-report'),
    path('reports/inventory/', views.ReportGeneratorViewSet.as_view({'post': 'generate_inventory_report'}), 
         name='generate-inventory-report'),
    
    # Inventory management endpoints
    path('inventory/low-stock/', views.InventoryRecordViewSet.as_view({'get': 'low_stock'}), 
         name='inventory-low-stock'),
]

"""
API Endpoint Summary for Assignment 3 Documentation:

UNIFIED USER SYSTEM:
- GET/POST /api/users/ - Manage all users (staff and customers)
- GET /api/users/pharmacists/ - Get pharmacists only
- GET /api/users/customers/ - Get customers only  
- GET /api/users/staff/ - Get all staff members
- POST /api/users/create-pharmacist/ - Factory Method for pharmacists
- POST /api/users/create-customer/ - Factory Method for customers
- POST /api/users/create-vip-customer/ - Factory Method for VIP customers

ORDER MANAGEMENT WITH DESIGN PATTERNS:
- GET/POST /api/orders/ - Manage unified orders
- POST /api/orders/{id}/transition/ - State Pattern status transitions
- GET /api/orders/{id}/available-transitions/ - State Pattern available moves
- POST /api/orders/{id}/process/ - Strategy Pattern processing
- GET /api/orders/{id}/calculate-total/ - Strategy Pattern calculations

FACTORY PATTERN IMPLEMENTATION:
- POST /api/factory/create-medicine/ - Factory Method for medicines
- POST /api/factory/create-supplement/ - Factory Method for supplements

BUSINESS OPERATIONS:
- POST /api/prescriptions/{id}/validate/ - Pharmacist validates prescription
- POST /api/deliveries/{id}/schedule/ - Schedule delivery with staff assignment
- POST /api/reports/sales/ - Generate sales reports
- POST /api/reports/staff-performance/ - Generate staff performance reports

This API structure demonstrates:
1. Factory Method Pattern in user and product creation
2. State Pattern in order status management  
3. Strategy Pattern in order processing
4. Unified models replacing separate inheritance hierarchies
5. Role-based access control through single User model
"""