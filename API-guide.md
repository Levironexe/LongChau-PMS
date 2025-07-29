# Long Châu Pharmacy API - Request & Response Formats

## 📋 What You Send vs What You Get Back

This guide shows the **exact format** of data you send to the server and what the server sends back to you.

---

## 🏢 Branch Management

### GET /api/branches/
**➡️ You Send:** Nothing (just the GET request)

**⬅️ You Receive:**
```json
{
  "count": 7,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Long Châu Quận 1",
      "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "phone": "028-3824-5678",
      "email": "q1@longchau.com.vn",
      "created_at": "2025-07-30T10:30:00Z",
      "updated_at": "2025-07-30T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Long Châu Quận 3",
      "address": "456 Võ Văn Tần, Quận 3, TP.HCM",
      "phone": "028-3932-1234",
      "email": "q3@longchau.com.vn",
      "created_at": "2025-07-30T10:30:00Z",
      "updated_at": "2025-07-30T10:30:00Z"
    }
  ]
}
```

### POST /api/branches/
**➡️ You Send:**
```json
{
  "name": "Long Châu Quận 8",
  "address": "123 Phạm Hùng, Quận 8, TP.HCM",
  "phone": "028-1234-5678",
  "email": "q8@longchau.com.vn"
}
```

**⬅️ You Receive:**
```json
{
  "id": 8,
  "name": "Long Châu Quận 8",
  "address": "123 Phạm Hùng, Quận 8, TP.HCM",
  "phone": "028-1234-5678",
  "email": "q8@longchau.com.vn",
  "created_at": "2025-07-30T15:45:23Z",
  "updated_at": "2025-07-30T15:45:23Z"
}
```

### GET /api/branches/1/
**➡️ You Send:** Nothing (just the GET request)

**⬅️ You Receive:**
```json
{
  "id": 1,
  "name": "Long Châu Quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "028-3824-5678",
  "email": "q1@longchau.com.vn",
  "created_at": "2025-07-30T10:30:00Z",
  "updated_at": "2025-07-30T10:30:00Z"
}
```

### PATCH /api/branches/1/
**➡️ You Send:** (Only fields you want to update)
```json
{
  "phone": "028-9999-8888"
}
```

**⬅️ You Receive:**
```json
{
  "id": 1,
  "name": "Long Châu Quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "028-9999-8888",
  "email": "q1@longchau.com.vn",
  "created_at": "2025-07-30T10:30:00Z",
  "updated_at": "2025-07-30T16:20:15Z"
}
```

---

## 👥 Staff Management

### GET /api/pharmacists/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "employee_id": "PH001",
      "first_name": "Nguyễn",
      "last_name": "Minh Anh",
      "email": "minh.anh@longchau.com.vn",
      "phone": "0901-234-567",
      "branch": 1,
      "hire_date": "2020-01-15",
      "is_active": true,
      "created_at": "2025-07-30T10:30:00Z",
      "license_number": "PH-12345-HCM",
      "specialization": "Clinical Pharmacy",
      "can_validate_prescriptions": true
    }
  ]
}
```

### POST /api/pharmacists/
**➡️ You Send:**
```json
{
  "employee_id": "PH011",
  "first_name": "Trần",
  "last_name": "Văn Đức",
  "email": "tran.van.duc@longchau.com.vn",
  "phone": "0901-888-999",
  "branch": 1,
  "hire_date": "2025-08-01",
  "license_number": "PH-11111-HCM",
  "specialization": "Hospital Pharmacy",
  "can_validate_prescriptions": true
}
```

**⬅️ You Receive:**
```json
{
  "id": 11,
  "employee_id": "PH011",
  "first_name": "Trần",
  "last_name": "Văn Đức",
  "email": "tran.van.duc@longchau.com.vn",
  "phone": "0901-888-999",
  "branch": 1,
  "hire_date": "2025-08-01",
  "is_active": true,
  "created_at": "2025-07-30T16:45:12Z",
  "license_number": "PH-11111-HCM",
  "specialization": "Hospital Pharmacy",
  "can_validate_prescriptions": true
}
```

---

## 👤 Customer Management

### GET /api/customers/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "customer_id": "CU001",
      "first_name": "Nguyễn",
      "last_name": "Văn An",
      "email": "nguyen.van.an@gmail.com",
      "phone": "0911-234-567",
      "date_of_birth": "1985-03-15",
      "address": "123 Lê Lợi, Quận 1, TP.HCM",
      "registration_date": "2023-01-15",
      "is_active": true,
      "created_at": "2025-07-30T10:30:00Z"
    }
  ]
}
```

### POST /api/customers/
**➡️ You Send:**
```json
{
  "customer_id": "CU016",
  "first_name": "Trần",
  "last_name": "Thị Ngọc",
  "email": "tran.thi.ngoc@gmail.com",
  "phone": "0911-333-444",
  "date_of_birth": "1992-08-15",
  "address": "789 Nguyễn Trãi, Quận 5, TP.HCM"
}
```

**⬅️ You Receive:**
```json
{
  "id": 16,
  "customer_id": "CU016",
  "first_name": "Trần",
  "last_name": "Thị Ngọc",
  "email": "tran.thi.ngoc@gmail.com",
  "phone": "0911-333-444",
  "date_of_birth": "1992-08-15",
  "address": "789 Nguyễn Trãi, Quận 5, TP.HCM",
  "registration_date": "2025-07-30",
  "is_active": true,
  "created_at": "2025-07-30T16:50:30Z"
}
```

---

## 💊 Product Management

### GET /api/medicines/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 20,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "product_code": "MED001",
      "name": "Paracetamol 500mg",
      "product_type": "medicine",
      "manufacturer": "Traphaco",
      "description": "Thuốc giảm đau, hạ sốt",
      "price": "12000.00",
      "requires_prescription": false,
      "is_available": true,
      "created_at": "2025-07-30T10:30:00Z",
      "active_ingredient": "Paracetamol",
      "dosage_form": "Tablet",
      "strength": "500mg",
      "therapeutic_class": "Analgesic"
    }
  ]
}
```

### POST /api/medicines/
**➡️ You Send:**
```json
{
  "product_code": "MED021",
  "name": "Aspirin 325mg",
  "manufacturer": "Bayer Vietnam",
  "description": "Thuốc giảm đau, chống viêm",
  "price": 45000,
  "active_ingredient": "Acetylsalicylic Acid",
  "dosage_form": "Tablet",
  "strength": "325mg",
  "therapeutic_class": "NSAID"
}
```

**⬅️ You Receive:**
```json
{
  "id": 21,
  "product_code": "MED021",
  "name": "Aspirin 325mg",
  "product_type": "medicine",
  "manufacturer": "Bayer Vietnam",
  "description": "Thuốc giảm đau, chống viêm",
  "price": "45000.00",
  "requires_prescription": false,
  "is_available": true,
  "created_at": "2025-07-30T17:10:45Z",
  "active_ingredient": "Acetylsalicylic Acid",
  "dosage_form": "Tablet",
  "strength": "325mg",
  "therapeutic_class": "NSAID"
}
```

---

## 📦 Inventory Management

### GET /api/inventory-records/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 48,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "branch": 1,
      "product": 1,
      "current_stock": 500,
      "minimum_stock": 50,
      "reorder_point": 100,
      "created_at": "2025-07-30T10:30:00Z",
      "updated_at": "2025-07-30T10:30:00Z"
    }
  ]
}
```

### POST /api/inventory-records/
**➡️ You Send:**
```json
{
  "branch": 1,
  "product": 21,
  "current_stock": 100,
  "minimum_stock": 10,
  "reorder_point": 25
}
```

**⬅️ You Receive:**
```json
{
  "id": 49,
  "branch": 1,
  "product": 21,
  "current_stock": 100,
  "minimum_stock": 10,
  "reorder_point": 25,
  "created_at": "2025-07-30T17:15:20Z",
  "updated_at": "2025-07-30T17:15:20Z"
}
```

### POST /api/inventory-transactions/
**➡️ You Send:**
```json
{
  "inventory_record": 49,
  "transaction_type": "stock_in",
  "quantity": 50,
  "previous_stock": 100,
  "new_stock": 150,
  "performed_by": 1,
  "notes": "Nhập hàng từ nhà cung cấp"
}
```

**⬅️ You Receive:**
```json
{
  "id": 31,
  "inventory_record": 49,
  "transaction_type": "stock_in",
  "quantity": 50,
  "previous_stock": 100,
  "new_stock": 150,
  "performed_by": 1,
  "transaction_date": "2025-07-30T17:20:15Z",
  "notes": "Nhập hàng từ nhà cung cấp"
}
```

---

## 🛒 Order Management

### GET /api/prescription-orders/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "order_number": "PRX20250001",
      "customer": 1,
      "branch": 1,
      "order_type": "prescription",
      "status": "completed",
      "order_date": "2025-07-26T10:00:00Z",
      "total_amount": "134000.00",
      "created_by": 1,
      "prescription": 1,
      "notes": "Đơn thuốc theo toa bác sĩ",
      "validated_by": 1,
      "validation_date": "2025-07-26T10:15:00Z"
    }
  ]
}
```

### POST /api/prescription-orders/
**➡️ You Send:**
```json
{
  "order_number": "PRX20250007",
  "customer": 1,
  "branch": 1,
  "total_amount": 150000,
  "created_by": 1,
  "prescription": 1,
  "notes": "Đơn thuốc khẩn cấp"
}
```

**⬅️ You Receive:**
```json
{
  "id": 7,
  "order_number": "PRX20250007",
  "customer": 1,
  "branch": 1,
  "order_type": "prescription",
  "status": "pending",
  "order_date": "2025-07-30T17:25:30Z",
  "total_amount": "150000.00",
  "created_by": 1,
  "prescription": 1,
  "notes": "Đơn thuốc khẩn cấp",
  "validated_by": null,
  "validation_date": null
}
```

### POST /api/order-items/
**➡️ You Send:** (For prescription order)
```json
{
  "prescription_order": 7,
  "product": 1,
  "quantity": 2,
  "unit_price": 12000,
  "total_price": 24000
}
```

**⬅️ You Receive:**
```json
{
  "id": 51,
  "prescription_order": 7,
  "instore_order": null,
  "online_order": null,
  "product": 1,
  "quantity": 2,
  "unit_price": "12000.00",
  "total_price": "24000.00",
  "created_at": "2025-07-30T17:30:45Z"
}
```

---

## 📋 Prescription Management

### GET /api/prescriptions/
**➡️ You Send:** Nothing

**⬅️ You Receive:**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "prescription_number": "RX2025001",
      "patient_name": "Nguyễn Văn An",
      "patient_dob": "1985-03-15",
      "doctor_name": "BS. Trần Minh Đức",
      "doctor_license": "BS-12345-HCM",
      "issue_date": "2025-07-25",
      "expiry_date": "2025-08-25",
      "status": "dispensed",
      "submitted_by": 1,
      "validated_by": 1,
      "validation_date": "2025-07-26T09:30:00Z",
      "validation_notes": "Đã kiểm tra, không có chống chỉ định",
      "created_at": "2025-07-30T10:30:00Z"
    }
  ]
}
```

### POST /api/prescriptions/
**➡️ You Send:**
```json
{
  "prescription_number": "RX2025013",
  "patient_name": "Nguyễn Thị Mai",
  "patient_dob": "1988-05-20",
  "doctor_name": "BS. Trần Văn Hùng",
  "doctor_license": "BS-99999-HCM",
  "issue_date": "2025-08-01",
  "expiry_date": "2025-09-01",
  "submitted_by": 1
}
```

**⬅️ You Receive:**
```json
{
  "id": 13,
  "prescription_number": "RX2025013",
  "patient_name": "Nguyễn Thị Mai",
  "patient_dob": "1988-05-20",
  "doctor_name": "BS. Trần Văn Hùng",
  "doctor_license": "BS-99999-HCM",
  "issue_date": "2025-08-01",
  "expiry_date": "2025-09-01",
  "status": "submitted",
  "submitted_by": 1,
  "validated_by": null,
  "validation_date": null,
  "validation_notes": "",
  "created_at": "2025-07-30T17:35:20Z"
}
```

---

## ❌ Error Response Formats

### Validation Errors (400)
**⬅️ You Receive:**
```json
{
  "email": ["This field must be unique."],
  "price": ["Ensure this value is greater than 0."],
  "product_code": ["This field is required."]
}
```

### Not Found (404)
**⬅️ You Receive:**
```json
{
  "detail": "Not found."
}
```

### Unauthorized (401)
**⬅️ You Receive:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Forbidden (403)
**⬅️ You Receive:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Server Error (500)
**⬅️ You Receive:**
```json
{
  "detail": "Internal server error."
}
```

---

## 📊 Data Type Reference

### **String Fields**
```json
{
  "name": "Long Châu Quận 1",           // Text
  "email": "q1@longchau.com.vn",        // Email format
  "phone": "028-3824-5678"              // Phone format
}
```

### **Number Fields**
```json
{
  "id": 1,                              // Integer
  "price": "12000.00",                  // Decimal (as string)
  "quantity": 5,                        // Integer
  "discount_rate": 15.00                // Float
}
```

### **Boolean Fields**
```json
{
  "is_active": true,                    // true/false
  "requires_prescription": false,       // true/false
  "can_validate_prescriptions": true    // true/false
}
```

### **Date/DateTime Fields**
```json
{
  "date_of_birth": "1985-03-15",                    // Date: YYYY-MM-DD
  "hire_date": "2020-01-15",                        // Date: YYYY-MM-DD
  "created_at": "2025-07-30T10:30:00Z",             // DateTime: ISO format
  "order_date": "2025-07-26T10:00:00Z"              // DateTime: ISO format
}
```

### **Array Fields**
```json
{
  "ingredients": ["Fish Oil", "EPA", "DHA"],        // Array of strings
  "supported_product_types": ["medicine", "otc"]    // Array of strings
}
```

### **Object Fields**
```json
{
  "operating_hours": {                              // JSON object
    "monday": "7:00-22:00",
    "tuesday": "7:00-22:00"
  },
  "report_data": {                                  // JSON object
    "total_orders": 45,
    "total_revenue": 2500000
  }
}
```

### **Foreign Key Fields**
```json
{
  "branch": 1,                         // Always send ID number
  "customer": 5,                       // Always send ID number  
  "product": 21                        // Always send ID number
}
```

---

## 💡 Important Notes

### **What Changes vs What Doesn't**

**✅ Fields You Control (Send):**
- `name`, `email`, `phone`, `address`
- `price`, `quantity`, `notes`
- `status` (for updates)

**🚫 Fields Django Controls (Don't Send):**
- `id` - Auto-generated
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

**🔄 Fields That Auto-Fill:**
- `registration_date` - Uses today's date if not provided
- `is_active` - Defaults to `true`
- `order_type` - Defaults based on endpoint

### **Null vs Missing Fields**

**In Responses, you might see:**
```json
{
  "validated_by": null,           // Field exists but no value
  "validation_date": null,        // Field exists but no value
  "notes": ""                     // Field exists but empty string
}
```

**In Requests, omit optional fields:**
```json
{
  "name": "Medicine Name",        // Required - include
  "price": 50000,                // Required - include
  // "notes": ""                  // Optional - omit entirely
}
```

This format guide shows **exactly** what frontend developers need to send and what they'll get back! 🎯