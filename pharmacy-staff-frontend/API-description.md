# Long Châu Pharmacy API - Updated RBAC & Warehouse Endpoint Guide

## 🏥 What Each Endpoint Does

**Base URL:** `https://longchau-pms.onrender.com/api/`

---

## 🏢 Branch Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/branches/` | GET | Get all pharmacy branches |
| `/branches/` | POST | Add a new pharmacy branch |
| `/branches/{id}/` | GET | Get details of one specific branch |
| `/branches/{id}/` | PUT | Update entire branch information |
| `/branches/{id}/` | PATCH | Update some branch information |
| `/branches/{id}/` | DELETE | Delete a branch |
| `/branches/{id}/staff-summary/` | GET | Get staff count by role for branch |
| `/branches/{id}/inventory-overview/` | GET | Get comprehensive inventory overview for a branch |
| `/branch-configs/` | GET | Get all branch settings |
| `/branch-configs/` | POST | Add settings for a branch |
| `/branch-configs/{id}/` | GET | Get specific branch configuration |
| `/branch-configs/{id}/` | PUT/PATCH | Update branch settings |
| `/branch-configs/{id}/` | DELETE | Delete branch configuration |

---

## 👥 Unified User Management (RBAC)

### Main User Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/` | GET | Get all users (staff and customers) |
| `/users/` | POST | Add a new user (any role) |
| `/users/{id}/` | GET | Get details of one user |
| `/users/{id}/` | PUT/PATCH | Update user information |
| `/users/{id}/` | DELETE | Remove a user |
| `/users/?role={role}` | GET | Filter users by specific role (e.g., `pharmacist`, `customer`) |

### Factory Method Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/create-pharmacist/` | POST | Create pharmacist with proper defaults |
| `/users/create-customer/` | POST | Create customer with proper defaults |
| `/users/create-vip-customer/` | POST | Create VIP customer with benefits |
| `/users/create-staff/` | POST | Create any staff member by role |

### Role-Based Filter Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/pharmacists/` | GET | Get all pharmacists only |
| `/users/customers/` | GET | Get all customers (regular + VIP) |
| `/users/staff/` | GET | Get all staff members |

### User Profile Management
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/user-profiles/` | GET | Get all user profiles |
| `/user-profiles/` | POST | Add profile for a user |
| `/user-profiles/{id}/` | GET | Get specific user profile |
| `/user-profiles/{id}/` | PUT/PATCH | Update user profile |
| `/user-profiles/{id}/` | DELETE | Delete user profile |
| `/users/{id}/upgrade-to-vip/` | POST | Upgrade customer to VIP status |

### Loyalty Points
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/loyalty-points/` | GET | Get all loyalty point records |
| `/loyalty-points/` | POST | Award points to customer |
| `/loyalty-points/{id}/` | GET | Get specific loyalty point record |
| `/loyalty-points/{id}/` | PUT/PATCH | Update loyalty points |
| `/loyalty-points/{id}/` | DELETE | Delete loyalty point record |

### Authentication Endpoints (NEW)
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/auth/login/` | POST | User login with username/password |
| `/auth/register/` | POST | Register new user account |
| `/auth/change-password/` | POST | Change user password |

---

## 📦 Warehouse Management (NEW)

### Warehouse Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/warehouses/` | GET | Get all warehouses |
| `/warehouses/` | POST | Add a new warehouse |
| `/warehouses/{id}/` | GET | Get details of one warehouse |
| `/warehouses/{id}/` | PUT/PATCH | Update warehouse information |
| `/warehouses/{id}/` | DELETE | Delete a warehouse |
| `/warehouses/{id}/inventory-status/` | GET | Get comprehensive warehouse inventory overview |

### Warehouse Inventory Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/warehouse-inventory/` | GET | Get all warehouse stock records |
| `/warehouse-inventory/` | POST | Add stock tracking for a product in warehouse |
| `/warehouse-inventory/{id}/` | GET | Get specific warehouse inventory record |
| `/warehouse-inventory/{id}/` | PUT/PATCH | Update warehouse stock levels |
| `/warehouse-inventory/{id}/` | DELETE | Delete warehouse inventory record |
| `/warehouse-inventory/add-stock/` | POST | Add stock to warehouse from suppliers |
| `/warehouse-inventory/low-stock/` | GET | Get low stock items in warehouse |

### Warehouse Transactions
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/warehouse-transactions/` | GET | Get all warehouse stock movements |
| `/warehouse-transactions/` | POST | Record warehouse stock movement |
| `/warehouse-transactions/{id}/` | GET | Get specific warehouse transaction |
| `/warehouse-transactions/{id}/` | PUT/PATCH | Update warehouse transaction |
| `/warehouse-transactions/{id}/` | DELETE | Delete warehouse transaction |

### Inventory Transfers
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/inventory-transfers/` | GET | Get all transfer records |
| `/inventory-transfers/` | POST | Create a new transfer record |
| `/inventory-transfers/{id}/` | GET | Get specific transfer record |
| `/inventory-transfers/{id}/` | PUT/PATCH | Update transfer record |
| `/inventory-transfers/{id}/` | DELETE | Delete transfer record |
| `/transfers/request/` | POST | Request stock transfer from warehouse to branch |
| `/transfers/{id}/approve/` | POST | Approve transfer request |
| `/transfers/{id}/complete/` | POST | Complete approved transfer |
| `/transfers/pending/` | GET | Get pending transfer requests |

---

## 💊 Product Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/medicines/` | GET | Get all medicines |
| `/medicines/` | POST | Add a new medicine |
| `/medicines/{id}/` | GET | Get details of one medicine |
| `/medicines/{id}/` | PUT/PATCH | Update medicine information |
| `/medicines/{id}/` | DELETE | Remove a medicine |
| `/prescription-medicines/` | GET | Get all prescription medicines |
| `/prescription-medicines/` | POST | Mark a medicine as prescription-only |
| `/prescription-medicines/{id}/` | GET | Get specific prescription medicine |
| `/prescription-medicines/{id}/` | PUT/PATCH | Update prescription medicine |
| `/prescription-medicines/{id}/` | DELETE | Delete prescription medicine |
| `/otc-medicines/` | GET | Get all over-the-counter medicines |
| `/otc-medicines/` | POST | Mark a medicine as over-the-counter |
| `/otc-medicines/{id}/` | GET | Get specific OTC medicine |
| `/otc-medicines/{id}/` | PUT/PATCH | Update OTC medicine |
| `/otc-medicines/{id}/` | DELETE | Delete OTC medicine |
| `/supplements/` | GET | Get all health supplements |
| `/supplements/` | POST | Add a new supplement |
| `/supplements/{id}/` | GET | Get specific supplement |
| `/supplements/{id}/` | PUT/PATCH | Update supplement information |
| `/supplements/{id}/` | DELETE | Delete supplement |
| `/medical-devices/` | GET | Get all medical devices |
| `/medical-devices/` | POST | Add a new medical device |
| `/medical-devices/{id}/` | GET | Get specific medical device |
| `/medical-devices/{id}/` | PUT/PATCH | Update device information |
| `/medical-devices/{id}/` | DELETE | Delete medical device |
| `/medicine-database/` | GET | Get all medicine database entries |
| `/medicine-database/` | POST | Add a new medicine database entry |
| `/medicine-database/{id}/` | GET | Get specific medicine database entry |
| `/medicine-database/{id}/` | PUT/PATCH | Update medicine database entry |
| `/medicine-database/{id}/` | DELETE | Delete medicine database entry |

---

## 📦 Inventory Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/inventory-records/` | GET | Get stock levels for all products at branches |
| `/inventory-records/` | POST | Add stock tracking for a product at a branch |
| `/inventory-records/{id}/` | GET | Get specific inventory record |
| `/inventory-records/{id}/` | PUT/PATCH | Update stock levels |
| `/inventory-records/{id}/` | DELETE | Delete inventory record |
| `/inventory/low-stock/` | GET | Get products with low stock at branches |
| `/inventory/branch-status/` | GET | Get comprehensive branch inventory status |
| `/inventory-transactions/` | GET | Get all branch stock movements (in/out) |
| `/inventory-transactions/` | POST | Record branch stock movement (performed by User) |
| `/inventory-transactions/{id}/` | GET | Get specific branch inventory transaction |
| `/inventory-transactions/{id}/` | PUT/PATCH | Update branch inventory transaction |
| `/inventory-transactions/{id}/` | DELETE | Delete branch inventory transaction |

---

## 🛒 Unified Order Management

### Unified Order System
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/` | GET | Get all orders (all types) |
| `/orders/` | POST | Create any type of order |
| `/orders/{id}/` | GET | Get details of one order |
| `/orders/{id}/` | PUT/PATCH | Update order information |
| `/orders/{id}/` | DELETE | Cancel an order |
| `/orders/?order_type={type}` | GET | Filter orders by type (e.g., `prescription`, `in_store`, `online`) |

### State Pattern Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/{id}/transition/` | POST | Change order status safely |
| `/orders/{id}/available-transitions/` | GET | Get valid status transitions |

### Strategy Pattern Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/{id}/process/` | POST | Process order using type-specific strategy |
| `/orders/{id}/calculate-total/` | GET | Calculate total using strategy pattern |

### Order Items
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/order-items/` | GET | Get all items in orders |
| `/order-items/` | POST | Add an item to an order |
| `/order-items/{id}/` | GET | Get specific order item |
| `/order-items/{id}/` | PUT/PATCH | Update order item |
| `/order-items/{id}/` | DELETE | Delete order item |

---

## 📋 Prescription Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/prescriptions/` | GET | Get all doctor prescriptions |
| `/prescriptions/` | POST | Submit a new prescription |
| `/prescriptions/{id}/` | GET | Get details of one prescription |
| `/prescriptions/{id}/` | PUT/PATCH | Update prescription |
| `/prescriptions/{id}/` | DELETE | Delete prescription |
| `/prescriptions/{id}/validate/` | POST | Pharmacist validates prescription |
| `/prescription-items/` | GET | Get all medicine items in prescriptions |
| `/prescription-items/` | POST | Add a medicine to a prescription |
| `/prescription-items/{id}/` | GET | Get specific prescription item |
| `/prescription-items/{id}/` | PUT/PATCH | Update prescription medicine |
| `/prescription-items/{id}/` | DELETE | Delete prescription item |

---

## 🚚 Unified Delivery Management

### Unified Delivery System
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/deliveries/` | GET | Get all deliveries (pickup + home) |
| `/deliveries/` | POST | Schedule any type of delivery |
| `/deliveries/{id}/` | GET | Get details of one delivery |
| `/deliveries/{id}/` | PUT/PATCH | Update delivery information |
| `/deliveries/{id}/` | DELETE | Delete delivery |
| `/deliveries/{id}/schedule/` | POST | Assign staff to delivery |
| `/deliveries/?delivery_type={type}` | GET | Filter deliveries by type (e.g., `pickup`, `home`) |

---

## 🏭 Factory Pattern & Reports

### Factory Pattern Endpoints
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/factory/create-medicine/` | POST | Create medicine using Factory Pattern |
| `/factory/create-supplement/` | POST | Create supplement using Factory Pattern |
| `/product-factories/` | GET | Get all product factories |
| `/product-factories/` | POST | Add a new factory |
| `/product-factories/{id}/` | GET | Get specific product factory |
| `/product-factories/{id}/` | PUT/PATCH | Update product factory |
| `/product-factories/{id}/` | DELETE | Delete product factory |

### Report Generation
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/reports/` | GET | Get all generated reports |
| `/reports/` | POST | Create a new report |
| `/reports/{id}/` | GET | Get specific report |
| `/reports/{id}/` | PUT/PATCH | Update report |
| `/reports/{id}/` | DELETE | Delete report |
| `/reports/sales/` | POST | Generate sales report |
| `/reports/staff-performance/` | POST | Generate staff performance report |
| `/reports/inventory/` | POST | Generate inventory report |
| `/reports/warehouse/` | POST | Generate warehouse report |

---

## 🎯 MAJOR API CHANGES from Previous Version

### 🔴 REMOVED Endpoints (Old Separate User Types)
```
❌ /api/customers/           → ✅ /api/users/?role=customer
❌ /api/vip-customers/       → ✅ /api/users/?role=vip_customer
❌ /api/pharmacists/         → ✅ /api/users/?role=pharmacist
❌ /api/technicians/         → ✅ /api/users/?role=technician
❌ /api/managers/            → ✅ /api/users/?role=manager
❌ /api/cashiers/            → ✅ /api/users/?role=cashier
❌ /api/inventory-managers/  → ✅ /api/users/?role=inventory_manager
```

### 🔴 REMOVED Endpoints (Old Separate Order Types)
```
❌ /api/prescription-orders/ → ✅ /api/orders/?order_type=prescription
❌ /api/instore-orders/      → ✅ /api/orders/?order_type=in_store
❌ /api/online-orders/       → ✅ /api/orders/?order_type=online
```

### 🔴 REMOVED Endpoints (Old Separate Delivery Types)
```
❌ /api/pickup-deliveries/   → ✅ /api/deliveries/?delivery_type=pickup
❌ /api/home-deliveries/     → ✅ /api/deliveries/?delivery_type=home
```

### 🆕 NEW Endpoints (RBAC, Warehouse, Authentication, Design Patterns)
```
✅ /api/users/create-pharmacist/       → Factory Method Pattern
✅ /api/users/create-customer/         → Factory Method Pattern
✅ /api/users/create-vip-customer/     → Factory Method Pattern
✅ /api/users/create-staff/            → Factory Method Pattern
✅ /api/orders/{id}/transition/        → State Pattern
✅ /api/orders/{id}/process/           → Strategy Pattern
✅ /api/factory/create-medicine/       → Factory Pattern
✅ /api/factory/create-supplement/     → Factory Pattern
✅ /api/reports/staff-performance/     → Uses unified User model
✅ /api/reports/warehouse/             → Warehouse report
✅ /api/warehouses/                    → Manage warehouses
✅ /api/warehouses/{id}/inventory-status/ → Warehouse inventory overview
✅ /api/warehouse-inventory/           → Warehouse stock records
✅ /api/warehouse-inventory/add-stock/ → Add stock to warehouse
✅ /api/warehouse-inventory/low-stock/ → Low warehouse stock items
✅ /api/warehouse-transactions/        → Warehouse transaction history
✅ /api/inventory-transfers/           → Manage inventory transfers
✅ /api/transfers/request/             → Request warehouse-to-branch transfer
✅ /api/transfers/{id}/approve/        → Approve transfer
✅ /api/transfers/{id}/complete/       → Complete transfer
✅ /api/transfers/pending/             → Get pending transfers
✅ /api/auth/login/                    → User login
✅ /api/auth/register/                 → User registration
✅ /api/auth/change-password/          → Change password
```

---

## 📝 Quick Migration Guide

### Frontend Code Changes Required:

#### User Management (Before → After)
```javascript
// OLD API calls
GET /api/customers/           → GET /api/users/?role=customer
GET /api/pharmacists/         → GET /api/users/?role=pharmacist
POST /api/pharmacists/        → POST /api/users/create-pharmacist/

// NEW unified approach
GET /api/users/pharmacists/   → Get pharmacists (shortcut)
GET /api/users/customers/     → Get customers (shortcut)
POST /api/users/create-vip-customer/ → Factory method
POST /api/auth/login/         → Authenticate user
POST /api/auth/register/      → Create user account
POST /api/auth/change-password/ → Update password
```

#### Order Management (Before → After)
```javascript
// OLD API calls
GET /api/prescription-orders/ → GET /api/orders/?order_type=prescription
POST /api/instore-orders/     → POST /api/orders/ (with order_type: 'in_store')

// NEW unified + patterns
POST /api/orders/{id}/transition/  → Safe status changes
POST /api/orders/{id}/process/     → Strategy-based processing
GET /api/orders/{id}/calculate-total/ → Strategy-based total calculation
```

#### Delivery Management (Before → After)
```javascript
// OLD API calls
GET /api/pickup-deliveries/   → GET /api/deliveries/?delivery_type=pickup
POST /api/home-deliveries/    → POST /api/deliveries/ (with delivery_type: 'home')

// NEW unified
POST /api/deliveries/{id}/schedule/ → Assign unified User as staff
```

#### Warehouse Management (NEW)
```javascript
// NEW warehouse endpoints
GET /api/warehouses/                  → Get all warehouses
POST /api/warehouse-inventory/add-stock/ → Add stock to warehouse
GET /api/warehouse-inventory/low-stock/ → Check low stock
POST /api/transfers/request/          → Request warehouse-to-branch transfer
POST /api/transfers/{id}/approve/     → Approve transfer
GET /api/transfers/pending/           → View pending transfers
```

---

## 🔧 API Architecture Benefits

### 1. Simplified Endpoints
- **Before:** 15+ user management endpoints, separate order/delivery types
- **After:** Unified user, order, and delivery endpoints with role/type filtering
- **Benefit:** Easier frontend development, consistent patterns

### 2. Design Pattern Integration
- **Factory Methods:** Safe object creation with validation
- **State Pattern:** Safe order status transitions
- **Strategy Pattern:** Flexible order processing

### 3. Role-Based Filtering
- **Single endpoint** with role parameters instead of multiple endpoints
- **Consistent response format** across all user types
- **Easier API maintenance** and documentation

### 4. Warehouse System
- **Comprehensive inventory tracking** across supplier, warehouse, branch, and customer
- **Automated transfer workflows** for efficient stock management
- **Detailed reporting** for warehouse operations

### 5. Authentication
- **Secure login/registration** with password hashing and account locking
- **Role-based permissions** ensure proper access control

### 6. Backward Compatibility
- **Shortcut endpoints** like `/users/pharmacists/` for convenience
- **Filter parameters** maintain similar functionality
- **Response format** remains consistent for frontend compatibility

This updated API structure reflects the RBAC architecture, warehouse system, and design pattern features, making it robust and developer-friendly! 🎯