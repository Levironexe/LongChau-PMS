# Long Châu Pharmacy API - Updated RBAC Request & Response Formats

## 📋 What You Send vs What You Get Back (RBAC Version)

This guide shows the **exact format** of data for the new unified User system and design patterns.

---

## 👥 **NEW: Unified User Management (RBAC)**

### GET /api/users/
**➡️ You Send:** Nothing (just the GET request)

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
  "created_at": "2025-07-30T17:45:12Z",
  "updated_at": "2025-07-30T17:45:12Z",
  "hire_date": "2025-07-30",
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
  "created_at": "2025-07-30T17:50:30Z",
  "customer_id": "VIP00001",
  "date_of_birth": "1988-05-20",
  "address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "registration_date": "2025-07-30",
  "membership_level": "Platinum",
  "discount_rate": "15.00",
  "membership_start_date": "2025-07-30",
  "display_name": "Nguyễn Thị Mai",
  "role_display": "VIP Customer"
}
```

### GET /api/users/pharmacists/
**➡️ You Send:** Nothing

**⬅️ You Receive:** (Only users with role='pharmacist')
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

---

## 🛒 **NEW: Unified Order Management**

### GET /api/orders/
**➡️ You Send:** Nothing

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
      "total_amount": "134000.00",
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
          "unit_price": "67000.00",
          "total_price": "134000.00"
        }
      ],
      "current_state_info": {
        "current_status": "completed",
        "allowed_actions": ["view_details", "download_receipt", "reorder"]
      },
      "available_transitions": [],
      "calculated_total": "159000.00",
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

### POST /api/orders/ (Unified Order Creation)
**➡️ You Send:**
```json
{
  "order_type": "prescription",
  "customer_id": 2,
  "branch_id": 1,
  "created_by_id": 1,
  "prescription_id": 2,
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
  "order_number": "PRE20250801001",
  "order_type": "prescription",
  "customer": 2,
  "branch": 1,
  "status": "pending",
  "order_date": "2025-07-30T18:00:00Z",
  "total_amount": "184000.00",
  "created_by": 1,
  "prescription": 2,
  "notes": "Đơn thuốc khẩn cấp",
  "items": [
    {
      "id": 45,
      "product": 5,
      "quantity": 1,
      "unit_price": "67000.00",
      "total_price": "67000.00"
    },
    {
      "id": 46,
      "product": 8,
      "quantity": 2,
      "unit_price": "58500.00",
      "total_price": "117000.00"
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
  "message": "Order PRE20250801001 transitioned from pending to processing",
  "order": {
    "id": 16,
    "order_number": "PRE20250801001",
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
    "order_number": "PRE20250801001",
    "status": "processing"
  },
  "processing_result": {
    "status": "processed",
    "message": "Prescription order processed successfully",
    "requires_pharmacist_approval": true
  }
}
```

---

## 🚚 **NEW: Unified Delivery Management**

### GET /api/deliveries/
**➡️ You Send:** Nothing

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
      "delivery_fee": "15000.00",
      "pickup_location": "",
      "customer_notified": true,
      "is_overdue": false,
      "delivery_type_display": {
        "type": "home",
        "is_pickup": false,
        "is_home_delivery": true,
        "fee": "15000.00"
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
  "scheduled_date": "2025-08-02T15:00:00Z",
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
  "scheduled_date": "2025-08-02T15:00:00Z",
  "delivery_address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "delivery_instructions": "Để ở cửa nếu không có nhà",
  "assigned_staff": null,
  "delivered_date": null,
  "created_at": "2025-07-30T18:10:00Z",
  "pickup_location": "",
  "customer_notified": false,
  "delivery_fee": "20000.00",
  "estimated_delivery_time": null,
  "gps_coordinates": ""
}
```

### POST /api/deliveries/{id}/schedule/
**➡️ You Send:**
```json
{
  "assigned_staff_id": 3,
  "scheduled_date": "2025-08-02T14:00:00Z"
}
```

**⬅️ You Receive:**
```json
{
  "id": 13,
  "order": 16,
  "delivery_type": "home",
  "status": "scheduled",
  "scheduled_date": "2025-08-02T14:00:00Z",
  "assigned_staff": 3,
  "assigned_staff_name": "Lê Văn Tài"
}
```

---

## 📋 **Updated Prescription Management**

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
  "validation_date": "2025-07-30T18:15:00Z",
  "validation_notes": "Đã kiểm tra, không có chống chỉ định"
}
```

---

## 🏭 **NEW: Factory Pattern Endpoints**

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
  "therapeutic