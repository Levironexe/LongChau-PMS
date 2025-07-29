# Long Châu Pharmacy API - Simple Endpoint Guide

## 🏥 What Each Endpoint Does

**Base URL:** `http://127.0.0.1:8000/api/`

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
| `/branch-configs/` | GET | Get all branch settings |
| `/branch-configs/` | POST | Add settings for a branch |
| `/branch-configs/{id}/` | PUT/PATCH | Update branch settings |

---

## 👥 Staff Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/pharmacists/` | GET | Get all pharmacists |
| `/pharmacists/` | POST | Add a new pharmacist |
| `/pharmacists/{id}/` | GET | Get details of one pharmacist |
| `/pharmacists/{id}/` | PUT/PATCH | Update pharmacist information |
| `/pharmacists/{id}/` | DELETE | Remove a pharmacist |
| `/technicians/` | GET | Get all pharmacy technicians |
| `/technicians/` | POST | Add a new technician |
| `/technicians/{id}/` | PUT/PATCH | Update technician information |
| `/managers/` | GET | Get all branch managers |
| `/managers/` | POST | Add a new manager |
| `/managers/{id}/` | PUT/PATCH | Update manager information |
| `/cashiers/` | GET | Get all cashiers |
| `/cashiers/` | POST | Add a new cashier |
| `/cashiers/{id}/` | PUT/PATCH | Update cashier information |
| `/inventory-managers/` | GET | Get all inventory managers |
| `/inventory-managers/` | POST | Add a new inventory manager |
| `/inventory-managers/{id}/` | PUT/PATCH | Update inventory manager information |

---

## 👤 Customer Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/customers/` | GET | Get all customers |
| `/customers/` | POST | Add a new customer |
| `/customers/{id}/` | GET | Get details of one customer |
| `/customers/{id}/` | PUT/PATCH | Update customer information |
| `/customers/{id}/` | DELETE | Remove a customer |
| `/vip-customers/` | GET | Get all VIP customers |
| `/vip-customers/` | POST | Make a customer VIP |
| `/vip-customers/{id}/` | PUT/PATCH | Update VIP customer settings |
| `/customer-profiles/` | GET | Get all customer medical profiles |
| `/customer-profiles/` | POST | Add medical profile for a customer |
| `/customer-profiles/{id}/` | PUT/PATCH | Update customer medical profile |

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
| `/otc-medicines/` | GET | Get all over-the-counter medicines |
| `/otc-medicines/` | POST | Mark a medicine as over-the-counter |
| `/supplements/` | GET | Get all health supplements |
| `/supplements/` | POST | Add a new supplement |
| `/supplements/{id}/` | PUT/PATCH | Update supplement information |
| `/medical-devices/` | GET | Get all medical devices |
| `/medical-devices/` | POST | Add a new medical device |
| `/medical-devices/{id}/` | PUT/PATCH | Update device information |

---

## 📦 Inventory Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/inventory-records/` | GET | Get stock levels for all products |
| `/inventory-records/` | POST | Add stock tracking for a product |
| `/inventory-records/{id}/` | PUT/PATCH | Update stock levels |
| `/inventory-transactions/` | GET | Get all stock movements (in/out) |
| `/inventory-transactions/` | POST | Record stock movement (add/remove stock) |

---

## 🛒 Order Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/prescription-orders/` | GET | Get all prescription orders |
| `/prescription-orders/` | POST | Create a new prescription order |
| `/prescription-orders/{id}/` | GET | Get details of one prescription order |
| `/prescription-orders/{id}/` | PUT/PATCH | Update prescription order |
| `/instore-orders/` | GET | Get all in-store purchases |
| `/instore-orders/` | POST | Create a new in-store purchase |
| `/instore-orders/{id}/` | PUT/PATCH | Update in-store purchase |
| `/online-orders/` | GET | Get all online orders |
| `/online-orders/` | POST | Create a new online order |
| `/online-orders/{id}/` | PUT/PATCH | Update online order |
| `/order-items/` | GET | Get all items in orders |
| `/order-items/` | POST | Add an item to an order |
| `/order-items/{id}/` | PUT/PATCH | Update order item |

---

## 📋 Prescription Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/prescriptions/` | GET | Get all doctor prescriptions |
| `/prescriptions/` | POST | Add a new doctor prescription |
| `/prescriptions/{id}/` | GET | Get details of one prescription |
| `/prescriptions/{id}/` | PUT/PATCH | Update prescription (validate/reject) |
| `/prescription-items/` | GET | Get all medicine items in prescriptions |
| `/prescription-items/` | POST | Add a medicine to a prescription |
| `/prescription-items/{id}/` | PUT/PATCH | Update prescription medicine |

---

## 🚚 Delivery Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/pickup-deliveries/` | GET | Get all pickup deliveries |
| `/pickup-deliveries/` | POST | Schedule a pickup delivery |
| `/pickup-deliveries/{id}/` | PUT/PATCH | Update pickup delivery status |
| `/home-deliveries/` | GET | Get all home deliveries |
| `/home-deliveries/` | POST | Schedule a home delivery |
| `/home-deliveries/{id}/` | PUT/PATCH | Update home delivery status |

---

## 🏭 System Management

| **Endpoint** | **Method** | **What It Does** |
|-------------|------------|------------------|
| `/product-factories/` | GET | Get all product factories |
| `/product-factories/` | POST | Add a new factory |
| `/reports/` | GET | Get all generated reports |
| `/reports/` | POST | Generate a new report |

---

## 🎯 Quick Reference

### **Most Common Actions:**

**Add New Data:**
- `POST /api/medicines/` → Add new medicine
- `POST /api/customers/` → Add new customer  
- `POST /api/pharmacists/` → Add new pharmacist
- `POST /api/prescription-orders/` → Create prescription order
- `POST /api/instore-orders/` → Create in-store purchase

**Get All Data:**
- `GET /api/medicines/` → See all medicines
- `GET /api/customers/` → See all customers
- `GET /api/pharmacists/` → See all pharmacists
- `GET /api/inventory-records/` → See all stock levels
- `GET /api/prescription-orders/` → See all prescription orders

**Update Data:**
- `PATCH /api/medicines/{id}/` → Update medicine info
- `PATCH /api/customers/{id}/` → Update customer info
- `PATCH /api/inventory-records/{id}/` → Update stock levels
- `PATCH /api/prescriptions/{id}/` → Validate/reject prescription

**Get One Item:**
- `GET /api/medicines/{id}/` → Get one specific medicine
- `GET /api/customers/{id}/` → Get one specific customer
- `GET /api/prescription-orders/{id}/` → Get one specific order

---

## 💡 Remember:
- Use `GET` to **fetch/view** data
- Use `POST` to **add new** data  
- Use `PATCH` to **update some** fields
- Use `PUT` to **update all** fields
- Use `DELETE` to **remove** data
- Replace `{id}` with actual number (like `/medicines/1/`)

**Example URLs:**
- `http://127.0.0.1:8000/api/medicines/` → All medicines
- `http://127.0.0.1:8000/api/medicines/5/` → Medicine with ID=5
- `http://127.0.0.1:8000/api/customers/` → All customers
- `http://127.0.0.1:8000/api/prescription-orders/` → All prescription orders