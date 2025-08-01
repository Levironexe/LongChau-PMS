# Long Châu Pharmacy API - Updated RBAC Endpoint Guide

## 🏥 What Each Endpoint Does

**Base URL:** `https://longchau-pms.onrender.com/api/`

---

## 🏢 Branch Management (Unchanged)

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/branches/` | GET | Get all pharmacy branches |
| `/branches/` | POST | Add a new pharmacy branch |
| `/branches/{id}/` | GET | Get details of one specific branch |
| `/branches/{id}/` | PUT | Update entire branch information |
| `/branches/{id}/` | PATCH | Update some branch information |
| `/branches/{id}/` | DELETE | Delete a branch |
| `/branches/{id}/staff-summary/` | GET | Get staff count by role for branch |
| `/branch-configs/` | GET | Get all branch settings |
| `/branch-configs/` | POST | Add settings for a branch |
| `/branch-configs/{id}/` | PUT/PATCH | Update branch settings |

---

## 👥 **NEW: Unified User Management (RBAC)**

### **Main User Endpoints**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/` | GET | Get all users (staff and customers) |
| `/users/` | POST | Add a new user (any role) |
| `/users/{id}/` | GET | Get details of one user |
| `/users/{id}/` | PUT/PATCH | Update user information |
| `/users/{id}/` | DELETE | Remove a user |
| `/users/?role=pharmacist` | GET | Filter users by specific role |

### **Factory Method Endpoints (NEW)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/create-pharmacist/` | POST | Create pharmacist with proper defaults |
| `/users/create-customer/` | POST | Create customer with proper defaults |
| `/users/create-vip-customer/` | POST | Create VIP customer with benefits |
| `/users/create-staff/` | POST | Create any staff member by role |

### **Role-Based Filter Endpoints (NEW)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/users/pharmacists/` | GET | Get all pharmacists only |
| `/users/customers/` | GET | Get all customers (regular + VIP) |
| `/users/staff/` | GET | Get all staff members |

### **User Profile Management**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/user-profiles/` | GET | Get all user profiles |
| `/user-profiles/` | POST | Add profile for a user |
| `/user-profiles/{id}/` | PUT/PATCH | Update user profile |
| `/users/{id}/upgrade-to-vip/` | POST | Upgrade customer to VIP status |

### **Loyalty Points**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/loyalty-points/` | GET | Get all loyalty point records |
| `/loyalty-points/` | POST | Award points to customer |
| `/loyalty-points/{id}/` | PUT/PATCH | Update loyalty points |

---

## 💊 Product Management (Unchanged)

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/medicines/` | GET | Get all medicines |
| `/medicines/` | POST | Add a new medicine |
| `/medicines/{id}/` | GET | Get details of one medicine |
| `/medicines/{id}/` | PUT/PATCH | Update medicine information |
| `/medicines/{id}/` | DELETE | Remove a medicine |
| `/prescription-medicines/` | GET | Get all prescription medicines |
| `/prescription-medicines/` | POST | Mark a medicine as prescription-only |
| `/otc-medicines/` | GET | Get all over-the-counter medicines |
| `/otc-medicines/` | POST | Mark a medicine as over-the-counter |
| `/supplements/` | GET | Get all health supplements |
| `/supplements/` | POST | Add a new supplement |
| `/supplements/{id}/` | PUT/PATCH | Update supplement information |
| `/medical-devices/` | GET | Get all medical devices |
| `/medical-devices/` | POST | Add a new medical device |
| `/medical-devices/{id}/` | PUT/PATCH | Update device information |

---

## 📦 Inventory Management (Updated for User)

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/inventory-records/` | GET | Get stock levels for all products |
| `/inventory-records/` | POST | Add stock tracking for a product |
| `/inventory-records/{id}/` | PUT/PATCH | Update stock levels |
| `/inventory/low-stock/` | GET | Get products with low stock |
| `/inventory-transactions/` | GET | Get all stock movements (in/out) |
| `/inventory-transactions/` | POST | Record stock movement (performed by User) |

---

## 🛒 **NEW: Unified Order Management**

### **Unified Order System (Replaces separate order types)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/` | GET | Get all orders (all types) |
| `/orders/` | POST | Create any type of order |
| `/orders/{id}/` | GET | Get details of one order |
| `/orders/{id}/` | PUT/PATCH | Update order information |
| `/orders/{id}/` | DELETE | Cancel an order |
| `/orders/?order_type=prescription` | GET | Filter orders by type |
| `/orders/?order_type=in_store` | GET | Get in-store orders only |
| `/orders/?order_type=online` | GET | Get online orders only |

### **State Pattern Endpoints (NEW)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/{id}/transition/` | POST | Change order status safely |
| `/orders/{id}/available-transitions/` | GET | Get valid status transitions |

### **Strategy Pattern Endpoints (NEW)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/orders/{id}/process/` | POST | Process order using type-specific strategy |
| `/orders/{id}/calculate-total/` | GET | Calculate total using strategy pattern |

### **Order Items**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/order-items/` | GET | Get all items in orders |
| `/order-items/` | POST | Add an item to an order |
| `/order-items/{id}/` | PUT/PATCH | Update order item |

---

## 📋 Prescription Management (Updated for User)

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/prescriptions/` | GET | Get all doctor prescriptions |
| `/prescriptions/` | POST | Submit a new prescription |
| `/prescriptions/{id}/` | GET | Get details of one prescription |
| `/prescriptions/{id}/` | PUT/PATCH | Update prescription |
| `/prescriptions/{id}/validate/` | POST | Pharmacist validates prescription |
| `/prescription-items/` | GET | Get all medicine items in prescriptions |
| `/prescription-items/` | POST | Add a medicine to a prescription |
| `/prescription-items/{id}/` | PUT/PATCH | Update prescription medicine |

---

## 🚚 **NEW: Unified Delivery Management**

### **Unified Delivery System (Replaces separate delivery types)**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/deliveries/` | GET | Get all deliveries (pickup + home) |
| `/deliveries/` | POST | Schedule any type of delivery |
| `/deliveries/{id}/` | GET | Get details of one delivery |
| `/deliveries/{id}/` | PUT/PATCH | Update delivery information |
| `/deliveries/{id}/schedule/` | POST | Assign staff to delivery |
| `/deliveries/?delivery_type=pickup` | GET | Get pickup deliveries only |
| `/deliveries/?delivery_type=home` | GET | Get home deliveries only |

---

## 🏭 **NEW: Factory Pattern & Reports**

### **Factory Pattern Endpoints**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/factory/create-medicine/` | POST | Create medicine using Factory Pattern |
| `/factory/create-supplement/` | POST | Create supplement using Factory Pattern |
| `/product-factories/` | GET | Get all product factories |
| `/product-factories/` | POST | Add a new factory |

### **Report Generation**
| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/reports/` | GET | Get all generated reports |
| `/reports/sales/` | POST | Generate sales report |
| `/reports/staff-performance/` | POST | Generate staff performance report |
| `/reports/inventory/` | POST | Generate inventory report |

---

## 🎯 **MAJOR API CHANGES from Assignment 2**

### **🔴 REMOVED Endpoints (Old separate user types)**
```
❌ /api/customers/           → ✅ /api/users/?role=customer
❌ /api/vip-customers/       → ✅ /api/users/?role=vip_customer  
❌ /api/pharmacists/         → ✅ /api/users/?role=pharmacist
❌ /api/technicians/         → ✅ /api/users/?role=technician
❌ /api/managers/            → ✅ /api/users/?role=manager
❌ /api/cashiers/            → ✅ /api/users/?role=cashier
❌ /api/inventory-managers/  → ✅ /api/users/?role=inventory_manager
```

### **🔴 REMOVED Endpoints (Old separate order types)**
```
❌ /api/prescription-orders/ → ✅ /api/orders/?order_type=prescription
❌ /api/instore-orders/      → ✅ /api/orders/?order_type=in_store
❌ /api/online-orders/       → ✅ /api/orders/?order_type=online
```

### **🔴 REMOVED Endpoints (Old separate delivery types)**
```
❌ /api/pickup-deliveries/   → ✅ /api/deliveries/?delivery_type=pickup
❌ /api/home-deliveries/     → ✅ /api/deliveries/?delivery_type=home
```

### **🆕 NEW Endpoints (RBAC + Design Patterns)**
```
✅ /api/users/create-pharmacist/       → Factory Method Pattern
✅ /api/orders/{id}/transition/        → State Pattern
✅ /api/orders/{id}/process/           → Strategy Pattern
✅ /api/factory/create-medicine/       → Factory Pattern
✅ /api/reports/staff-performance/     → Uses unified User model
```

---

## 📝 Quick Migration Guide

### **Frontend Code Changes Required:**

#### **User Management (Before → After)**
```javascript
// OLD Assignment 2 API calls
GET /api/customers/           → GET /api/users/?role=customer
GET /api/pharmacists/         → GET /api/users/?role=pharmacist
POST /api/pharmacists/        → POST /api/users/create-pharmacist/

// NEW Assignment 3 unified approach
GET /api/users/pharmacists/   → Get pharmacists (shortcut)
GET /api/users/customers/     → Get customers (shortcut)
POST /api/users/create-vip-customer/ → Factory method
```

#### **Order Management (Before → After)**
```javascript
// OLD Assignment 2 API calls  
GET /api/prescription-orders/ → GET /api/orders/?order_type=prescription
POST /api/instore-orders/     → POST /api/orders/ (with order_type: 'in_store')

// NEW Assignment 3 unified + patterns
POST /api/orders/{id}/transition/  → Safe status changes
GET /api/orders/{id}/process/      → Strategy-based processing
```

#### **Delivery Management (Before → After)**
```javascript
// OLD Assignment 2 API calls
GET /api/pickup-deliveries/   → GET /api/deliveries/?delivery_type=pickup
POST /api/home-deliveries/    → POST /api/deliveries/ (with delivery_type: 'home')

// NEW Assignment 3 unified
POST /api/deliveries/{id}/schedule/ → Assign unified User as staff
```

---

## 🔧 **API Architecture Benefits**

### **1. Simplified Endpoints**
- **Before:** 15+ user management endpoints
- **After:** 6 main user endpoints with role filtering
- **Benefit:** Easier frontend development, consistent patterns

### **2. Design Pattern Integration**
- **Factory Methods:** Safe object creation with validation
- **State Pattern:** Safe order status transitions
- **Strategy Pattern:** Flexible order processing

### **3. Role-Based Filtering**
- **Single endpoint** with role parameters instead of multiple endpoints
- **Consistent response format** across all user types
- **Easier API maintenance** and documentation

### **4. Backward Compatibility**
- **Shortcut endpoints** like `/users/pharmacists/` for convenience
- **Filter parameters** maintain similar functionality
- **Response format** remains consistent for frontend compatibility

This updated API structure reflects your RBAC architecture while maintaining usability and adding powerful design pattern features! 🎯