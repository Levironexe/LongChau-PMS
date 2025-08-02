# Long Châu Pharmacy API - Updated RBAC & Warehouse Request & Response Formats

This guide shows the **exact format** of data for the new unified User system, warehouse system, authentication, and design patterns.

**Base URL:** `https://longchau-pms.onrender.com/api/`

---

## 👥 Unified User Management (RBAC)

### GET /api/users/
**➡️ You Send:** Nothing (or optional query params like `?role=pharmacist`)

**⬅️ You Receive:**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user_id": "PH0001",
      "first_name": "Nguyễn",
      "last_name": "Minh Anh",
      "email": "minh.anh@longchau.com.vn",
      "phone": "0901-234-567",
      "role": "pharmacist",
      "branch": 1,
      "is_active": true,
      "created_at": "2025-07-30T10:30:00Z",
      "updated_at": "2025-07-30T10:30:00Z",
      "hire_date": "2020-01-15",
      "employee_id": "PH0001",
      "license_number": "PH-12345-HCM",
      "specialization": "Clinical Pharmacy",
      "can_validate_prescriptions": true,
      "customer_id": null,
      "date_of_birth": null,
      "membership_level": null,
      "display_name": "Dr. Nguyễn Minh Anh",
      "role_display": "Pharmacist",
      "is_staff_member": true,
      "is_customer_member": false,
      "can_validate": true
    },
    {
      "id": 2,
      "user_id": "CUST000001",
      "first_name": "Trần",
      "last_name": "Văn An",
      "email": "tran.van.an@gmail.com",
      "phone": "0911-234-567",
      "role": "customer",
      "branch": 1,
      "is_active": true,
      "created_at": "2025-07-30T10:30:00Z",
      "updated_at": "2025-07-30T10:30:00Z",
      "hire_date": null,
      "employee_id": null,
      "license_number": null,
      "customer_id": "CUST000001",
      "date_of_birth": "1985-03-15",
      "address": "123 Lê Lợi, Quận 1, TP.HCM",
      "registration_date": "2023-01-15",
      "membership_level": null,
      "discount_rate": null,
      "display_name": "Trần Văn An",
      "role_display": "Customer",
      "is_staff_member": false,
      "is_customer_member": true,
      "can_validate": false
    }
  ]
}
```

### POST /api/users/create-pharmacist/ (Factory Method)
**➡️ You Send:**
```json
{
  "first_name": "Trần",
  "last_name": "Văn Đức",
  "email": "tran.van.duc@longchau.com.vn",
  "phone": "0901-888-999",
  "branch": 1,
  "license_number": "PH-11111-HCM",
  "specialization": "Hospital Pharmacy"
}
```

**⬅️ You Receive:**
```json
{
  "id": 26,
  "user_id": "PH0011",
  "first_name": "Trần",
  "last_name": "Văn Đức",
  "email": "tran.van.duc@longchau.com.vn",
  "phone": "0901-888-999",
  "role": "pharmacist",
  "branch": 1,
  "is_active": true,
  "created_at": "2025-08-02T16:00:00Z",
  "updated_at": "2025-08-02T16:00:00Z",
  "hire_date": "2025-08-02",
  "employee_id": "PH0011",
  "license_number": "PH-11111-HCM",
  "specialization": "Hospital Pharmacy",
  "can_validate_prescriptions": true,
  "display_name": "Dr. Trần Văn Đức",
  "role_display": "Pharmacist"
}
```

### POST /api/users/create-vip-customer/ (Factory Method)
**➡️ You Send:**
```json
{
  "first_name": "Nguyễn",
  "last_name": "Thị Mai",
  "email": "nguyen.thi.mai@gmail.com",
  "phone": "0911-555-666",
  "date_of_birth": "1988-05-20",
  "address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "branch": 1,
  "membership_level": "Platinum"
}
```

**⬅️ You Receive:**
```json
{
  "id": 27,
  "user_id": "VIP00001",
  "first_name": "Nguyễn",
  "last_name": "Thị Mai",
  "email": "nguyen.thi.mai@gmail.com",
  "phone": "0911-555-666",
  "role": "vip_customer",
  "branch": 1,
  "is_active": true,
  "created_at": "2025-08-02T16:10:00Z",
  "updated_at": "2025-08-02T16:10:00Z",
  "customer_id": "VIP00001",
  "date_of_birth": "1988-05-20",
  "address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "registration_date": "2025-08-02",
  "membership_level": "Platinum",
  "discount_rate": "15.00",
  "membership_start_date": "2025-08-02",
  "display_name": "Nguyễn Thị Mai",
  "role_display": "VIP Customer"
}
```

### GET /api/users/pharmacists/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "user_id": "PH0001",
      "first_name": "Nguyễn",
      "last_name": "Minh Anh",
      "role": "pharmacist",
      "license_number": "PH-12345-HCM",
      "can_validate_prescriptions": true,
      "display_name": "Dr. Nguyễn Minh Anh"
    }
  ]
}
```

### POST /api/auth/login/ (NEW)
**➡️ You Send:**
```json
{
  "username": "minh.anh",
  "password": "securepassword123"
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "minh.anh",
    "name": "Dr. Nguyễn Minh Anh",
    "role": "pharmacist",
    "branch_id": 1,
    "branch_name": "Long Châu Quận 1",
    "permissions": {
      "can_validate_prescriptions": true,
      "can_approve_orders": false,
      "is_staff": true,
      "is_customer": false
    }
  }
}
```

### POST /api/auth/register/ (NEW)
**➡️ You Send:**
```json
{
  "user_id": 27,
  "username": "nguyen.thi.mai",
  "email": "nguyen.thi.mai@gmail.com",
  "password": "newpassword123"
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "account": {
    "id": 1,
    "username": "nguyen.thi.mai",
    "email": "nguyen.thi.mai@gmail.com",
    "is_active": true,
    "created_at": "2025-08-02T16:20:00Z",
    "updated_at": "2025-08-02T16:20:00Z"
  }
}
```

### POST /api/auth/change-password/ (NEW)
**➡️ You Send:**
```json
{
  "username": "minh.anh",
  "old_password": "securepassword123",
  "new_password": "newsecurepassword456"
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📦 Warehouse Management (NEW)

### GET /api/warehouses/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Main Warehouse HCM",
      "address": "456 Nguyễn Văn Cừ, Quận 5, TP.HCM",
      "manager": 3,
      "manager_name": "Lê Văn Tài",
      "capacity": 10000,
      "total_stock": 7500,
      "utilization_percentage": 75.0,
      "created_at": "2025-07-01T10:00:00Z"
    }
  ]
}
```

### GET /api/warehouses/{id}/inventory-status/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "warehouse": {
    "id": 1,
    "name": "Main Warehouse HCM",
    "manager": "Lê Văn Tài",
    "total_stock": 7500,
    "utilization_percentage": 75.0
  },
  "inventory_summary": {
    "total_products": 50,
    "low_stock_count": 5,
    "total_value": 12500000.00
  },
  "low_stock_items": [
    {
      "product_name": "Paracetamol 500mg",
      "current_stock": 20,
      "reorder_point": 50,
      "cost_price": 30000.00
    }
  ],
  "recent_transactions": [
    {
      "type": "stock_in",
      "product_name": "Amoxicillin 500mg",
      "quantity": 100,
      "date": "2025-08-01T09:00:00Z",
      "performed_by": "Lê Văn Tài"
    }
  ],
  "pending_transfers": 2
}
```

### POST /api/warehouse-inventory/add-stock/
**➡️ You Send:**
```json
{
  "warehouse_id": 1,
  "product_id": 5,
  "quantity": 100,
  "cost_price": 30000.00,
  "performed_by_id": 3,
  "supplier": "Glaxo Vietnam",
  "notes": "New stock from supplier"
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Added 100 units to warehouse",
  "record": {
    "id": 10,
    "warehouse": 1,
    "product": 5,
    "current_stock": 120,
    "minimum_stock": 50,
    "reorder_point": 100,
    "cost_price": 30000.00,
    "supplier": "Glaxo Vietnam",
    "last_restocked": "2025-08-02T16:30:00Z"
  }
}
```

### GET /api/warehouse-inventory/low-stock/
**➡️ You Send:** Optional `?warehouse_id=1`

**⬅️ You Receive:**
```json
[
  {
    "id": 8,
    "warehouse": 1,
    "product": 4,
    "product_name": "Paracetamol 500mg",
    "current_stock": 20,
    "reorder_point": 50,
    "cost_price": 30000.00
  }
]
```

### POST /api/transfers/request/
**➡️ You Send:**
```json
{
  "branch_id": 1,
  "warehouse_id": 1,
  "product_id": 5,
  "quantity": 50,
  "requested_by_id": 3,
  "notes": "Urgent restock for branch"
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "transfer": {
    "id": 1,
    "transfer_number": "TR20250802001",
    "status": "pending",
    "source_warehouse": 1,
    "destination_branch": 1,
    "product": 5,
    "quantity": 50,
    "unit_cost": 30000.00,
    "requested_by": 3,
    "request_date": "2025-08-02T16:40:00Z",
    "notes": "Urgent restock for branch"
  }
}
```

### POST /api/transfers/{id}/approve/
**➡️ You Send:**
```json
{
  "approver_id": 3
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Transfer TR20250802001 approved",
  "transfer": {
    "id": 1,
    "transfer_number": "TR20250802001",
    "status": "approved",
    "approved_by": 3,
    "approved_date": "2025-08-02T16:45:00Z"
  }
}
```

### POST /api/transfers/{id}/complete/
**➡️ You Send:**
```json
{
  "receiving_user_id": 1
}
```

**⬅️ You Receive:**
```json
{
  "success": true,
  "message": "Transfer TR20250802001 completed",
  "transfer": {
    "id": 1,
    "transfer_number": "TR20250802001",
    "status": "completed",
    "received_date": "2025-08-02T16:50:00Z"
  }
}
```

### GET /api/transfers/pending/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
[
  {
    "id": 2,
    "transfer_number": "TR20250802002",
    "status": "pending",
    "source_warehouse": 1,
    "destination_branch": 2,
    "product": 6,
    "product_name": "Ibuprofen 400mg",
    "quantity": 30,
    "request_date": "2025-08-02T16:00:00Z"
  }
]
```

---

## 🛒 Unified Order Management

### GET /api/orders/
**➡️ You Send:** Nothing (or optional `?order_type=prescription`)

**⬅️ You Receive:**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "order_number": "PRX20250001",
      "order_type": "prescription",
      "customer": 2,
      "customer_name": "Trần Văn An",
      "customer_role": "customer",
      "branch": 1,
      "branch_name": "Long Châu Quận 1",
      "status": "completed",
      "order_date": "2025-07-26T10:00:00Z",
      "total_amount": 134000.00,
      "created_by": 1,
      "created_by_name": "Dr. Nguyễn Minh Anh",
      "validated_by": 1,
      "validated_by_name": "Dr. Nguyễn Minh Anh",
      "prescription": 1,
      "notes": "Đơn thuốc theo toa bác sĩ",
      "items": [
        {
          "id": 1,
          "product": 5,
          "product_name": "Amoxicillin 500mg",
          "quantity": 2,
          "unit_price": 67000.00,
          "total_price": 134000.00
        }
      ],
      "current_state_info": {
        "current_status": "completed",
        "allowed_actions": ["view_details", "download_receipt", "reorder"]
      },
      "available_transitions": [],
      "calculated_total": 159000.00,
      "processing_strategy": {
        "strategy_type": "PrescriptionOrderStrategy",
        "order_type": "prescription",
        "requires_validation": true,
        "requires_delivery": false
      }
    }
  ]
}
```

### POST /api/orders/
**➡️ You Send:**
```json
{
  "order_type": "prescription",
  "customer_id": 2,
  "branch_id": 1,
  "created_by_id": 1,
  "prescription_id": 2,
  "delivery_address": "123 Lê Lợi, Quận 1, TP.HCM",
  "delivery_instructions": "Gọi trước khi giao",
  "items": [
    {
      "product_id": 5,
      "quantity": 1
    },
    {
      "product_id": 8,
      "quantity": 2
    }
  ],
  "notes": "Đơn thuốc khẩn cấp"
}
```

**⬅️ You Receive:**
```json
{
  "id": 16,
  "order_number": "PRE20250802001",
  "order_type": "prescription",
  "customer": 2,
  "branch": 1,
  "status": "pending",
  "order_date": "2025-08-02T16:55:00Z",
  "total_amount": 184000.00,
  "created_by": 1,
  "prescription": 2,
  "delivery_address": "123 Lê Lợi, Quận 1, TP.HCM",
  "delivery_instructions": "Gọi trước khi giao",
  "notes": "Đơn thuốc khẩn cấp",
  "items": [
    {
      "id": 45,
      "product": 5,
      "quantity": 1,
      "unit_price": 67000.00,
      "total_price": 67000.00
    },
    {
      "id": 46,
      "product": 8,
      "quantity": 2,
      "unit_price": 58500.00,
      "total_price": 117000.00
    }
  ]
}
```

### POST /api/orders/{id}/transition/ (State Pattern)
**➡️ You Send:**
```json
{
  "new_status": "processing",
  "user_id": 1
}
```

**⬅️ You Receive:**
```json
{
  "message": "Order PRE20250802001 transitioned from pending to processing",
  "order": {
    "id": 16,
    "order_number": "PRE20250802001",
    "status": "processing",
    "current_state_info": {
      "current_status": "processing",
      "allowed_actions": ["update_status", "add_notes", "complete_order", "cancel_order"]
    },
    "available_transitions": ["completed", "cancelled"]
  }
}
```

### GET /api/orders/{id}/available-transitions/ (State Pattern)
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "current_status": "processing",
  "available_transitions": ["completed", "cancelled"],
  "allowed_actions": ["update_status", "add_notes", "complete_order", "cancel_order"]
}
```

### POST /api/orders/{id}/process/ (Strategy Pattern)
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "order": {
    "id": 16,
    "order_number": "PRE20250802001",
    "status": "processing"
  },
  "processing_result": {
    "status": "processed",
    "message": "Prescription order processed successfully",
    "requires_pharmacist_approval": true
  }
}
```

### GET /api/orders/{id}/calculate-total/ (Strategy Pattern)
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "order_number": "PRE20250802001",
  "order_type": "prescription",
  "calculated_total": 209000.00,
  "current_total": 184000.00
}
```

---

## 🚚 Unified Delivery Management

### GET /api/deliveries/
**➡️ You Send:** Nothing (or optional `?delivery_type=home`)

**⬅️ You Receive:**
```json
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "order": 1,
      "order_number": "PRX20250001",
      "customer_name": "Trần Văn An",
      "delivery_type": "home",
      "status": "delivered",
      "scheduled_date": "2025-07-27T14:00:00Z",
      "delivery_address": "123 Lê Lợi, Quận 1, TP.HCM",
      "delivery_instructions": "Gọi chuông 2 lần",
      "assigned_staff": 3,
      "assigned_staff_name": "Lê Văn Tài",
      "delivered_date": "2025-07-27T14:30:00Z",
      "delivery_fee": 15000.00,
      "pickup_location": "",
      "customer_notified": true,
      "is_overdue": false,
      "delivery_type_display": {
        "type": "home",
        "is_pickup": false,
        "is_home_delivery": true,
        "fee": 15000.00
      }
    }
  ]
}
```

### POST /api/deliveries/
**➡️ You Send:**
```json
{
  "order": 16,
  "delivery_type": "home",
  "scheduled_date": "2025-08-03T15:00:00Z",
  "delivery_address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "delivery_instructions": "Để ở cửa nếu không có nhà",
  "delivery_fee": 20000
}
```

**⬅️ You Receive:**
```json
{
  "id": 13,
  "order": 16,
  "delivery_type": "home",
  "status": "scheduled",
  "scheduled_date": "2025-08-03T15:00:00Z",
  "delivery_address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "delivery_instructions": "Để ở cửa nếu không có nhà",
  "assigned_staff": null,
  "delivered_date": null,
  "created_at": "2025-08-02T17:00:00Z",
  "pickup_location": "",
  "customer_notified": false,
  "delivery_fee": 20000.00,
  "estimated_delivery_time": null,
  "gps_coordinates": ""
}
```

### POST /api/deliveries/{id}/schedule/
**➡️ You Send:**
```json
{
  "assigned_staff_id": 3,
  "scheduled_date": "2025-08-03T14:00:00Z"
}
```

**⬅️ You Receive:**
```json
{
  "id": 13,
  "order": 16,
  "delivery_type": "home",
  "status": "scheduled",
  "scheduled_date": "2025-08-03T14:00:00Z",
  "assigned_staff": 3,
  "assigned_staff_name": "Lê Văn Tài"
}
```

---

## 📋 Prescription Management

### POST /api/prescriptions/{id}/validate/
**➡️ You Send:**
```json
{
  "pharmacist_id": 1,
  "notes": "Đã kiểm tra, không có chống chỉ định"
}
```

**⬅️ You Receive:**
```json
{
  "id": 2,
  "prescription_number": "RX2025002",
  "status": "validated",
  "validated_by": 1,
  "validated_by_name": "Dr. Nguyễn Minh Anh",
  "validation_date": "2025-08-02T17:10:00Z",
  "validation_notes": "Đã kiểm tra, không có chống chỉ định"
}
```

---

## 🏭 Factory Pattern Endpoints

### POST /api/factory/create-medicine/
**➡️ You Send:**
```json
{
  "product_code": "MED025",
  "name": "Ibuprofen 400mg",
  "manufacturer": "Glaxo Vietnam",
  "description": "Thuốc giảm đau, chống viêm",
  "price": 85000,
  "active_ingredient": "Ibuprofen",
  "dosage_form": "Tablet",
  "strength": "400mg",
  "therapeutic_class": "NSAID"
}
```

**⬅️ You Receive:**
```json
{
  "id": 25,
  "product_code": "MED025",
  "name": "Ibuprofen 400mg",
  "manufacturer": "Glaxo Vietnam",
  "description": "Thuốc giảm đau, chống viêm",
  "price": 85000.00,
  "active_ingredient": "Ibuprofen",
  "dosage_form": "Tablet",
  "strength": "400mg",
  "therapeutic_class": "NSAID",
  "requires_prescription": false,
  "is_available": true,
  "created_at": "2025-08-02T17:15:00Z"
}
```

### POST /api/factory/create-supplement/
**➡️ You Send:**
```json
{
  "product_code": "SUP001",
  "name": "Vitamin C 1000mg",
  "manufacturer": "Nature Made",
  "description": "Bổ sung vitamin C tăng cường miễn dịch",
  "price": 120000,
  "supplement_type": "Vitamin",
  "dosage_instructions": "1 viên/ngày",
  "ingredients": ["Vitamin C", "Citric Acid"]
}
```

**⬅️ You Receive:**
```json
{
  "id": 1,
  "product_code": "SUP001",
  "name": "Vitamin C 1000mg",
  "manufacturer": "Nature Made",
  "description": "Bổ sung vitamin C tăng cường miễn dịch",
  "price": 120000.00,
  "supplement_type": "Vitamin",
  "dosage_instructions": "1 viên/ngày",
  "ingredients": ["Vitamin C", "Citric Acid"],
  "is_available": true,
  "created_at": "2025-08-02T17:20:00Z"
}
```

---

## 📊 Report Generation

### POST /api/reports/sales/
**➡️ You Send:**
```json
{
  "branch_id": 1,
  "start_date": "2025-07-01",
  "end_date": "2025-08-02",
  "generated_by_id": 1
}
```

**⬅️ You Receive:**
```json
{
  "id": 1,
  "report_name": "Sales Report 2025-07-01 to 2025-08-02",
  "report_type": "sales",
  "branch": 1,
  "generated_by": 1,
  "start_date": "2025-07-01",
  "end_date": "2025-08-02",
  "generated_at": "2025-08-02T17:25:00Z",
  "report_data": {
    "total_orders": 50,
    "total_revenue": 12500000.00,
    "average_order_value": 250000.00,
    "orders_by_type": {
      "prescription": {
        "count": 20,
        "revenue": 5000000.00
      },
      "in_store": {
        "count": 25,
        "revenue": 6000000.00
      },
      "online": {
        "count": 5,
        "revenue": 1500000.00
      }
    },
    "period": "2025-07-01 to 2025-08-02"
  }
}
```

### POST /api/reports/warehouse/
**➡️ You Send:**
```json
{
  "warehouse_id": 1,
  "generated_by_id": 3
}
```

**⬅️ You Receive:**
```json
{
  "id": 2,
  "report_name": "Warehouse Report - Main Warehouse HCM",
  "report_type": "warehouse",
  "branch": 1,
  "generated_by": 3,
  "start_date": "2025-08-02",
  "end_date": "2025-08-02",
  "generated_at": "2025-08-02T17:30:00Z",
  "report_data": {
    "warehouse_id": 1,
    "warehouse_name": "Main Warehouse HCM",
    "total_products": 50,
    "low_stock_items": 5,
    "total_stock_value": 12500000.00,
    "utilization_percentage": 75.0,
    "recent_transfers": 10
  }
}
```