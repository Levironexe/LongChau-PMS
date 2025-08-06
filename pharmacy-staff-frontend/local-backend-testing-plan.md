# local-backend-testing-plan.md

## 🚨 **Local Backend Testing Plan for Transfer Deletion Bug**

### **Overview**
Test the transfer completion bug locally using only backend + curl testing:
1. Run Django backend locally on `localhost:8000`
2. Use curl commands to test transfer APIs directly
3. Add debugging code to local backend only
4. Identify root cause of record deletions
5. Test fixes locally before any production deployment

**Note**: We'll skip frontend changes entirely until the backend bug is fixed

---

## 🔧 **Phase 1: Local Backend Setup**

### **Step 1.1: Backend Environment Setup**
```bash
# Navigate to backend directory
cd /Users/skadi2910/projects/LongChau-PMS/pharmacy_poc_backend

# Activate virtual environment (create if doesn't exist)
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Check database configuration
cat pharmacy_poc_backend/settings.py | grep -A 10 DATABASES
```

### **Step 1.2: Database Setup for Local Testing**
```bash
# Option A: Use local SQLite for testing (safer)
# Modify settings.py temporarily to use SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'test_db.sqlite3',
    }
}

# Option B: Use local PostgreSQL copy (if needed)
# Create local database copy for testing
createdb pharmacy_test_db
pg_dump [production_db] | psql pharmacy_test_db
```

### **Step 1.3: Run Migrations and Create Test Data**
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Load or create test data
python manage.py shell
# >>> Create test warehouses, products, branches, users
```

### **Step 1.4: Start Local Django Server**
```bash
# Start local development server
python manage.py runserver 8000

# Verify server is running
curl http://localhost:8000/api/products/
```

---

## 🔧 **Phase 2: Direct API Testing with curl**

### **Step 2.1: Verify Local Backend APIs**
```bash
# Test basic API endpoints
curl http://localhost:8000/api/products/
curl http://localhost:8000/api/warehouses/
curl http://localhost:8000/api/branches/
curl http://localhost:8000/api/users/
curl http://localhost:8000/api/inventory-transfers/
```

### **Step 2.2: Test Transfer Workflow via curl**
```bash
# 1. Create transfer request
curl -X POST "http://localhost:8000/api/inventory-transfers/" \
  -H "Content-Type: application/json" \
  -d '{
    "source_warehouse": 1,
    "destination_branch": 1, 
    "product": 1,
    "quantity": 100,
    "requested_by": 1,
    "notes": "Test transfer"
  }'

# 2. Approve transfer
curl -X POST "http://localhost:8000/api/inventory-transfers/1/approve_transfer/" \
  -H "Content-Type: application/json" \
  -d '{"approver_id": 1}'

# 3. Complete transfer (THIS IS WHERE BUG OCCURS)
curl -X POST "http://localhost:8000/api/inventory-transfers/1/complete_transfer/" \
  -H "Content-Type: application/json" \
  -d '{"receiving_user_id": 1}'
```

### **Step 2.3: Database State Verification Commands**
```bash
# Before transfer completion
curl http://localhost:8000/api/warehouse-inventory/ | grep -A5 -B5 "product.*1"
curl http://localhost:8000/api/inventory/ | grep -A5 -B5 "product.*1"

# After transfer completion (check if records disappeared)
curl http://localhost:8000/api/warehouse-inventory/ | grep -A5 -B5 "product.*1"
curl http://localhost:8000/api/inventory/ | grep -A5 -B5 "product.*1"
```

---

## 🔍 **Phase 3: Debugging Implementation**

### **Step 3.1: Add Comprehensive Logging**
**File**: `/Users/skadi2910/projects/LongChau-PMS/pharmacy_poc_backend/core/models.py`

```python
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

# Add to complete_transfer method (line 1014):
@transaction.atomic
def complete_transfer(self, receiving_user):
    logger.info(f"=== STARTING TRANSFER COMPLETION ===")
    logger.info(f"Transfer: {self.transfer_number}")
    logger.info(f"Product: {self.product.name} (ID: {self.product.id})")
    logger.info(f"Warehouse: {self.source_warehouse.name} (ID: {self.source_warehouse.id})")
    logger.info(f"Branch: {self.destination_branch.name} (ID: {self.destination_branch.id})")
    logger.info(f"Quantity: {self.quantity}")
    
    if self.status != 'approved':
        raise ValueError("Transfer must be approved before completion")
    
    # Check if all parent records exist BEFORE starting
    logger.info("=== CHECKING PARENT RECORDS ===")
    medicine_exists = Medicine.objects.filter(id=self.product.id).exists()
    warehouse_exists = Warehouse.objects.filter(id=self.source_warehouse.id).exists()
    branch_exists = PharmacyBranch.objects.filter(id=self.destination_branch.id).exists()
    
    logger.info(f"Medicine exists: {medicine_exists}")
    logger.info(f"Warehouse exists: {warehouse_exists}")
    logger.info(f"Branch exists: {branch_exists}")
    
    if not all([medicine_exists, warehouse_exists, branch_exists]):
        raise ValueError("Parent records missing before transfer completion")
    
    # Step 1: Decrease warehouse stock
    logger.info("=== STEP 1: WAREHOUSE STOCK UPDATE ===")
    try:
        warehouse_record = WarehouseInventoryRecord.objects.get(
            warehouse=self.source_warehouse, product=self.product)
        logger.info(f"Found warehouse record ID: {warehouse_record.id}")
        logger.info(f"Current warehouse stock: {warehouse_record.current_stock}")
        
        original_stock = warehouse_record.current_stock
        warehouse_record.current_stock -= self.quantity
        logger.info(f"New warehouse stock: {warehouse_record.current_stock}")
        
        warehouse_record.save()
        logger.info(f"Warehouse record saved successfully")
        
        # Verify record still exists after save
        still_exists = WarehouseInventoryRecord.objects.filter(id=warehouse_record.id).exists()
        logger.info(f"Warehouse record still exists after save: {still_exists}")
        
    except Exception as e:
        logger.error(f"Error in warehouse stock update: {str(e)}")
        raise
    
    # Step 2: Create warehouse transaction
    logger.info("=== STEP 2: WAREHOUSE TRANSACTION ===")
    try:
        wh_transaction = WarehouseInventoryTransaction.objects.create(
            warehouse_record=warehouse_record,
            transaction_type='stock_out',
            quantity=-self.quantity,
            previous_stock=original_stock,
            new_stock=warehouse_record.current_stock,
            performed_by=receiving_user,
            transfer_reference=self.transfer_number,
            notes=f"Transfer to {self.destination_branch.name}"
        )
        logger.info(f"Created warehouse transaction ID: {wh_transaction.id}")
    except Exception as e:
        logger.error(f"Error creating warehouse transaction: {str(e)}")
        raise
    
    # Step 3: Update/create branch stock  
    logger.info("=== STEP 3: BRANCH STOCK UPDATE ===")
    try:
        branch_record, created = InventoryRecord.objects.get_or_create(
            branch=self.destination_branch, product=self.product,
            defaults={'current_stock': 0})
        logger.info(f"Branch record ID: {branch_record.id}, created: {created}")
        logger.info(f"Current branch stock: {branch_record.current_stock}")
        
        previous_branch_stock = branch_record.current_stock
        branch_record.current_stock += self.quantity
        logger.info(f"New branch stock: {branch_record.current_stock}")
        
        branch_record.save()
        logger.info(f"Branch record saved successfully")
        
        # Verify record still exists after save
        still_exists = InventoryRecord.objects.filter(id=branch_record.id).exists()
        logger.info(f"Branch record still exists after save: {still_exists}")
        
    except Exception as e:
        logger.error(f"Error in branch stock update: {str(e)}")
        raise
    
    # Step 4: Create branch transaction
    logger.info("=== STEP 4: BRANCH TRANSACTION ===")
    try:
        br_transaction = InventoryTransaction.objects.create(
            inventory_record=branch_record,
            transaction_type='stock_in',
            quantity=self.quantity,
            previous_stock=previous_branch_stock,
            new_stock=branch_record.current_stock,
            performed_by=receiving_user,
            notes=f"Transfer from warehouse: {self.transfer_number}"
        )
        logger.info(f"Created branch transaction ID: {br_transaction.id}")
    except Exception as e:
        logger.error(f"Error creating branch transaction: {str(e)}")
        raise
    
    # Step 5: Update transfer status
    logger.info("=== STEP 5: TRANSFER STATUS UPDATE ===")
    try:
        self.status = 'completed'
        self.received_date = timezone.now()
        self.save()
        logger.info(f"Transfer status updated to completed")
    except Exception as e:
        logger.error(f"Error updating transfer status: {str(e)}")
        raise
    
    # Final verification
    logger.info("=== FINAL VERIFICATION ===")
    final_warehouse_exists = WarehouseInventoryRecord.objects.filter(id=warehouse_record.id).exists()
    final_branch_exists = InventoryRecord.objects.filter(id=branch_record.id).exists()
    final_medicine_exists = Medicine.objects.filter(id=self.product.id).exists()
    
    logger.info(f"Final warehouse record exists: {final_warehouse_exists}")
    logger.info(f"Final branch record exists: {final_branch_exists}")
    logger.info(f"Final medicine record exists: {final_medicine_exists}")
    
    logger.info(f"=== TRANSFER COMPLETION FINISHED ===")
```

### **Step 3.2: Configure Logging Settings**
**File**: `/Users/skadi2910/projects/LongChau-PMS/pharmacy_poc_backend/pharmacy_poc_backend/settings.py`

```python
# Add detailed logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'transfer_debug.log',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'core.models': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

---

## 🧪 **Phase 4: Testing Procedure**

### **Step 4.1: Create Test Data**
```bash
# Access Django shell
python manage.py shell

# Create test data
from core.models import *

# Create warehouse
warehouse = Warehouse.objects.create(name="Test Warehouse", address="Test Address", capacity=10000)

# Create branch  
branch = PharmacyBranch.objects.create(name="Test Branch", address="Test Branch Address")

# Create product
product = Medicine.objects.create(name="Test Medicine", product_code="TEST001", price=10.00)

# Create warehouse inventory
wh_inventory = WarehouseInventoryRecord.objects.create(
    warehouse=warehouse, product=product, current_stock=1000, minimum_stock=50, reorder_point=100, cost_price=5.00
)

# Create users
user = User.objects.create(user_id="TEST001", first_name="Test", last_name="User", role="inventory_manager", branch=branch)
```

### **Step 4.2: Create and Execute Test Transfer**
```bash
# Create transfer request
transfer = InventoryTransfer.objects.create(
    transfer_number="TEST-001",
    source_warehouse=warehouse,
    destination_branch=branch, 
    product=product,
    quantity=100,
    requested_by=user,
    status='approved'  # Skip approval for testing
)

# Execute completion via API
curl -X POST "http://localhost:8000/api/inventory-transfers/{transfer.id}/complete_transfer/" \
  -H "Content-Type: application/json" \
  -d '{"receiving_user_id": {user.id}}'
```

### **Step 4.3: Monitor Logs in Real-Time**
```bash
# Terminal 1: Monitor Django server logs
python manage.py runserver 8000

# Terminal 2: Monitor debug log file
tail -f transfer_debug.log

# Terminal 3: Execute API call and watch for issues
```

### **Step 4.4: Verify Database State After Transfer**
```bash
# Immediately after transfer completion
python manage.py shell

# Check if records still exist
WarehouseInventoryRecord.objects.filter(product=product).exists()
InventoryRecord.objects.filter(product=product).exists()  
Medicine.objects.filter(id=product.id).exists()

# Check stock levels
WarehouseInventoryRecord.objects.get(product=product).current_stock  # Should be 900
InventoryRecord.objects.get(product=product).current_stock           # Should be 100
```

---

## 🔧 **Phase 5: Root Cause Analysis**

### **Step 5.1: Analyze Debug Logs**
- Identify at which step records disappear
- Check for database constraint violations
- Look for CASCADE deletion triggers
- Identify any ORM-related issues

### **Step 5.2: Database Query Analysis**
```sql
-- If using PostgreSQL, enable query logging
SET log_statement = 'all';
SET log_min_duration_statement = 0;

-- Monitor actual SQL queries during transfer completion
-- Look for unexpected DELETE statements
```

### **Step 5.3: Test Different Scenarios**
1. **Scenario A**: Transfer with existing branch inventory
2. **Scenario B**: Transfer creating new branch inventory  
3. **Scenario C**: Transfer with insufficient warehouse stock
4. **Scenario D**: Transfer with invalid foreign keys

---

## 🔧 **Phase 6: Fix Implementation & Testing**

### **Step 6.1: Implement Fix Based on Root Cause**
Based on findings, implement appropriate fix:
- Add `@transaction.atomic` if transaction issue
- Fix constraint violations if database issue
- Add validation if data integrity issue
- Fix ORM usage if Django-specific issue

### **Step 6.2: Test Fix Locally**
```bash
# Test same scenarios with fix applied
# Verify records no longer disappear
# Confirm stock levels update correctly
```

### **Step 6.3: Validate Fix with curl Testing**
```bash
# Test complete transfer workflow with fix applied
# Verify no records are deleted and stock levels update correctly

# Before fix - records disappear
# After fix - records preserved with updated stock levels
```

---

## 🚀 **Phase 7: Production Deployment (After Local Success)**

### **Step 7.1: Clean Up Debug Code**
- Remove verbose logging from production code
- Keep only essential error handling
- Remove development-only configurations

### **Step 7.2: Deploy to Production**
- Apply tested fix to production codebase
- Monitor production logs for issues
- Have rollback plan ready

---

## ✅ **Success Criteria**

### **Local Testing Success:**
- ✅ Transfer completion works without record deletion
- ✅ Warehouse inventory record updated (not deleted)
- ✅ Branch inventory record created/updated (not deleted)
- ✅ All transaction records created properly
- ✅ Debug logs show clear execution flow

### **Production Readiness:**
- ✅ Fix tested thoroughly in local environment
- ✅ Root cause identified and addressed
- ✅ No side effects on other functionality
- ✅ Performance impact minimal
- ✅ Rollback plan prepared

This approach ensures safe, isolated testing without any risk to production data or users.

---

## 📝 **Execution Notes**

### **Important Reminders:**
- 🚨 **NEVER** deploy debugging code to production
- 🚨 **ALWAYS** test locally first before any production changes
- 🚨 **BACKUP** any database before making changes
- 🚨 **REVERT** frontend API endpoint after testing
- 🚨 **DOCUMENT** all findings and changes made

### **Emergency Rollback:**
If anything goes wrong during local testing:
1. Stop Django server: `Ctrl+C`
2. Revert all code changes: `git checkout -- .`
3. Delete test database: `rm test_db.sqlite3`
4. Restart fresh: `python manage.py migrate`

### **After Testing Complete:**
1. Document root cause and fix in separate .md file
2. Create clean implementation for production
3. Remove all debugging code
4. Test production fix in staging environment
5. Deploy to production with monitoring