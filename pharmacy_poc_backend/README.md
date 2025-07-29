# Pharmacy POC Backend

Simple pharmacy management system with 4 core operations.

## Setup

```bash
# 1. Create project
mkdir pharmacy_poc_backend && cd pharmacy_poc_backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install Django>=4.2.0 djangorestframework django-cors-headers

# 3. Create Django structure
django-admin startproject pharmacy_management .
python manage.py startapp core
python manage.py startapp api

# 4. Copy files to match this structure:
# pharmacy_poc_backend/
# ├── requirements.txt
# ├── manage.py
# ├── pharmacy_management/
# │   ├── settings.py    # Replace with provided
# │   └── urls.py        # Replace with provided
# ├── core/
# │   ├── models.py      # Replace with provided
# │   └── admin.py       # Replace with provided
# └── api/
#     ├── serializers.py # Create with provided
#     ├── views.py       # Replace with provided
#     └── urls.py        # Create with provided

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create admin user (optional)
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
```

## API Endpoints

- **Products**: `/api/products/` - CRUD operations
- **Inventory**: `/api/inventory/` - Stock management
- **Customers**: `/api/customers/` - Customer management  
- **Orders**: `/api/orders/` - Order processing

## Key Features

- ✅ Product management (medicines/supplements)
- ✅ Inventory tracking with low stock alerts
- ✅ Customer management with VIP upgrades
- ✅ Order processing with automatic VIP discounts
- ✅ Admin interface at `/admin/`

## Quick Test

```bash
# Create a product
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Aspirin", "product_type": "medicine", "price": "5.99"}'

# Create a customer  
curl -X POST http://localhost:8000/api/customers/ \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890"}'

# Check low stock
curl http://localhost:8000/api/inventory/low_stock/
```