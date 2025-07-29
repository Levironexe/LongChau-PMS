# api/urls.py - REPLACE YOUR ENTIRE FILE WITH THIS
# ============================================================================
# ============================================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Branch and Configuration
router.register(r'branches', views.PharmacyBranchViewSet)
router.register(r'branch-configs', views.BranchConfigurationViewSet)

# Staff (Concrete classes only)
router.register(r'pharmacists', views.PharmacistViewSet)
router.register(r'technicians', views.PharmacyTechnicianViewSet)
router.register(r'managers', views.BranchManagerViewSet)
router.register(r'cashiers', views.CashierViewSet)
router.register(r'inventory-managers', views.InventoryManagerViewSet)

# Customers
router.register(r'customers', views.CustomerViewSet)
router.register(r'vip-customers', views.VIPCustomerViewSet)
router.register(r'customer-profiles', views.CustomerProfileViewSet)

# Products (Concrete classes only)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'prescription-medicines', views.PrescriptionMedicineViewSet)
router.register(r'otc-medicines', views.OverTheCounterMedicineViewSet)
router.register(r'supplements', views.HealthSupplementViewSet)
router.register(r'medical-devices', views.MedicalDeviceViewSet)

# Inventory
router.register(r'inventory-records', views.InventoryRecordViewSet)
router.register(r'inventory-transactions', views.InventoryTransactionViewSet)

# Orders (Concrete classes only)
router.register(r'prescription-orders', views.PrescriptionOrderViewSet)
router.register(r'instore-orders', views.InStoreOrderViewSet)  
router.register(r'online-orders', views.OnlineOrderViewSet)
router.register(r'order-items', views.OrderItemViewSet)

# Prescriptions
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'prescription-items', views.PrescriptionItemViewSet)

# Deliveries (Concrete classes only)
router.register(r'pickup-deliveries', views.PickUpDeliveryViewSet)
router.register(r'home-deliveries', views.HomeDeliveryViewSet)

# Factory and Reports
router.register(r'product-factories', views.ProductFactoryViewSet)
router.register(r'reports', views.ReportGeneratorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]