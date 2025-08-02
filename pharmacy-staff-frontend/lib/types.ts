export interface Product {
  id: number
  name: string
  product_type: "medicine" | "supplement" | "medical_device"
  price: string // Decimal as string
  requires_prescription: boolean
  created_at: string
  stock?: number // From backend calculation
  description?: string
  manufacturer?: string
  batch_number?: string
  expiry_date?: string
  updated_at?: string
}

// Medicine interface extending Product
export interface Medicine extends Product {
  product_type: "medicine"
  active_ingredient: string
  dosage_form: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops"
  strength: string
  therapeutic_class?: string
  contraindications?: string
  side_effects?: string
  storage_conditions?: string
  is_prescription: boolean // Specific to medicines
  drug_schedule?: "I" | "II" | "III" | "IV" | "V" | "OTC"
}

// Supplement interface extending Product  
export interface Supplement extends Product {
  product_type: "supplement"
  supplement_type: "vitamin" | "mineral" | "herbal" | "protein" | "probiotic" | "other"
  ingredients: string[]
  serving_size?: string
  servings_per_container?: number
  nutritional_facts?: Record<string, string>
  age_group?: "adult" | "child" | "senior" | "all"
  health_benefits?: string[]
}

// Medical Device interface extending Product
export interface MedicalDevice extends Product {
  product_type: "medical_device"
  device_type: "diagnostic" | "therapeutic" | "surgical" | "monitoring" | "mobility" | "other"
  device_class: "I" | "II" | "III"
  regulatory_approval?: string
  warranty_period?: string
  usage_instructions?: string
  maintenance_requirements?: string
  safety_warnings?: string[]
}

export interface Inventory {
  id: number
  product: number // Product ID
  product_name?: string // From backend
  current_stock: number
  minimum_stock: number
  is_low_stock?: boolean // From backend calculation
  created_at: string
}

// Unified User interface (replaces separate Customer/Staff interfaces)
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: "customer" | "vip_customer" | "pharmacist" | "technician" | "manager" | "cashier" | "inventory_manager"
  is_active?: boolean
  status?: "active" | "inactive" // For frontend compatibility
  created_at?: string
  updated_at?: string
  address?: string
  date_of_birth?: string
  registration_date?: string
  hire_date?: string
  notes?: string
  total_orders?: number
  total_spent?: number
  loyalty_points?: number
  // Backend-specific fields (optional for compatibility)
  display_name?: string
  role_display?: string
  user_id?: string
  employee_id?: string
  customer_id?: string
  branch?: number
}

// Legacy Customer interface for backward compatibility
export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  customer_type: "regular" | "vip"
  created_at: string
}

export interface Order {
  id: number
  customer: number // Customer ID
  customer_name?: string // From backend
  total_amount: string // Decimal as string
  status: "pending" | "processing" | "completed" | "cancelled"
  order_type: "prescription" | "in_store" | "online"
  order_date: string
  items?: OrderItem[]
  available_transitions?: string[]
  payment_method?: "cash" | "card" | "insurance"
  notes?: string
}

export interface OrderItem {
  id: number
  order: number
  product: number
  product_name?: string
  quantity: number
  unit_price: string
}

export interface CreateOrderRequest {
  customer: number // Backend uses 'customer' not 'customer_id'
  order_type: "prescription" | "in_store" | "online"
  payment_method?: "cash" | "card" | "insurance"
  items: {
    product: number // Backend uses 'product' not 'product_id'
    quantity: number
  }[]
  notes?: string
  branch?: number // May be required by backend
}

// New interfaces for API changes
export interface LoyaltyPoints {
  id: number
  customer: number
  customer_name: string
  points: number
  earned_date: string
  expiry_date: string
  transaction_reference: string
  is_expired: boolean
}

// Loyalty Points List Response (Paginated)
export interface LoyaltyPointsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: LoyaltyPoints[]
}

// Create Loyalty Points Request
export interface CreateLoyaltyPointsRequest {
  customer: number
  points: number
  expiry_date: string
  transaction_reference: string
}

// Update Loyalty Points Request
export interface UpdateLoyaltyPointsRequest {
  customer?: number
  points?: number
  expiry_date?: string
  transaction_reference?: string
}


export interface Delivery {
  id: number
  order_number: string
  customer_name: string
  assigned_staff_name: string
  is_overdue: boolean
  delivery_type_display: {
    type: string
    is_pickup: boolean
    is_home_delivery: boolean
    fee: number
  }
  delivery_type: "pickup" | "home"
  status: "scheduled" | "in_transit" | "delivered" | "cancelled"
  scheduled_date: string
  delivery_address: string
  delivery_instructions: string
  delivered_date: string | null
  created_at: string
  pickup_location: string
  customer_notified: boolean
  delivery_fee: string
  estimated_delivery_time: string
  gps_coordinates: string
  order: number
  assigned_staff: number
}

export interface Report {
  id: number
  generated_by_name: string
  branch_name: string
  report_summary: Record<string, any>
  report_name: string
  report_type: "sales" | "staff_performance" | "inventory" | "prescription"
  start_date: string
  end_date: string
  report_data: Record<string, any>
  generated_at: string
  branch: number
  generated_by: number
}

export interface ReportsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Report[]
}

export interface CreateReportRequest {
  report_name: string
  report_type: "sales" | "staff_performance" | "inventory" | "prescription"
  start_date: string
  end_date: string
  branch: number
  generated_by: number
}

// Factory method request interfaces
export interface CreateUserRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: User['role']
  address?: string
  date_of_birth?: string
  notes?: string
}

// Factory method requests don't require role (automatically set)
export interface CreateFactoryUserRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  date_of_birth?: string
  notes?: string
}

export interface OrderTransition {
  from_status: string
  to_status: string
  allowed: boolean
  reason?: string
}

// Branch Management Interfaces
export interface Branch {
  id: number
  name: string
  address: string
  phone: string
  email: string
  created_at: string
  updated_at: string
  
  // API-provided statistics
  user_count?: number
  staff_count?: number
  customer_count?: number
  
  // Optional fields (may not be provided by API)
  manager_name?: string
  manager_id?: number
  status?: "active" | "inactive" | "maintenance"
  opening_hours?: string
  established_date?: string
  notes?: string
  is_active?: boolean
  total_products?: number
}

export interface BranchStaffSummary {
  branch_id: number
  branch_name: string
  staff_counts: {
    pharmacist: number
    technician: number
    manager: number
    cashier: number
    inventory_manager: number
  }
  total_staff: number
}

export interface BranchConfig {
  id: number
  branch: number // Branch ID
  setting_name: string
  setting_value: string | number | boolean
  setting_type: "string" | "number" | "boolean"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateBranchRequest {
  name: string
  address: string
  phone: string
  email: string
  manager_name?: string
  manager_id?: number
  status?: "active" | "inactive" | "maintenance"
  opening_hours?: string
  notes?: string
}

// Product Filter Interfaces
export interface ProductFilters {
  product_type?: "medicine" | "supplement" | "medical_device"
  requires_prescription?: boolean
  manufacturer?: string
  search?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
}

export interface MedicineFilters extends ProductFilters {
  product_type?: "medicine"
  dosage_form?: Medicine['dosage_form']
  therapeutic_class?: string
  is_prescription?: boolean
  drug_schedule?: Medicine['drug_schedule']
  active_ingredient?: string
}

export interface SupplementFilters extends ProductFilters {
  product_type?: "supplement"
  supplement_type?: Supplement['supplement_type']
  age_group?: Supplement['age_group']
}

export interface MedicalDeviceFilters extends ProductFilters {
  product_type?: "medical_device"
  device_type?: MedicalDevice['device_type']
  device_class?: MedicalDevice['device_class']
}

// Create Request Interfaces
export interface CreateMedicineRequest {
  name: string
  price: string
  description?: string
  manufacturer?: string
  batch_number?: string
  expiry_date?: string
  active_ingredient: string
  dosage_form: Medicine['dosage_form']
  strength: string
  therapeutic_class?: string
  contraindications?: string
  side_effects?: string
  storage_conditions?: string
  is_prescription: boolean
  drug_schedule?: Medicine['drug_schedule']
  requires_prescription: boolean // For base Product interface
}

export interface CreateSupplementRequest {
  name: string
  price: string
  description?: string
  manufacturer?: string
  batch_number?: string
  expiry_date?: string
  supplement_type: Supplement['supplement_type']
  ingredients: string[]
  serving_size?: string
  servings_per_container?: number
  nutritional_facts?: Record<string, string>
  age_group?: Supplement['age_group']
  health_benefits?: string[]
  requires_prescription: boolean // For base Product interface
}

export interface CreateMedicalDeviceRequest {
  name: string
  price: string
  description?: string
  manufacturer?: string
  batch_number?: string
  expiry_date?: string
  device_type: MedicalDevice['device_type']
  device_class: MedicalDevice['device_class']
  regulatory_approval?: string
  warranty_period?: string
  usage_instructions?: string
  maintenance_requirements?: string
  safety_warnings?: string[]
  requires_prescription: boolean // For base Product interface
}

// Inventory Records - Interface matching actual API response
export interface InventoryRecord {
  id: number
  product?: number // Product ID (from API)
  product_name?: string // Product name (from API)
  product_code?: string // Product code (from API)
  branch: number // Branch ID
  branch_name?: string // Branch name (from API)
  current_stock: number // Actual API field name
  minimum_stock: number // Actual API field name
  reorder_point?: number // Actual API field name
  is_low_stock: boolean // Backend calculated field
  stock_status?: "in_stock" | "low_stock" | "out_of_stock" // From API
  created_at: string
  updated_at: string
  
  // Optional fields that may be present
  medicine?: number // Medicine ID (nullable)
  supplement?: number // Supplement ID (nullable)  
  medical_device?: number // Medical Device ID (nullable)
  unit_cost?: string // Decimal as string
  total_value?: string // Decimal as string (calculated)
  expiry_date?: string
  batch_number?: string
  supplier?: string
  last_restocked?: string
  max_stock_level?: number
  product_type?: "medicine" | "supplement" | "medical_device"
  // Backward compatibility fields
  stock_level?: number // Alias for current_stock
  reorder_level?: number // Alias for minimum_stock
}

// Inventory Transactions - Track all inventory movements
export interface InventoryTransaction {
  id: number
  medicine?: number // Medicine ID (nullable)
  supplement?: number // Supplement ID (nullable)
  medical_device?: number // Medical Device ID (nullable)
  branch: number // Branch ID
  transaction_type: "restock" | "sale" | "adjustment" | "expired" | "damaged" | "transfer"
  quantity: number // Positive for additions, negative for reductions
  unit_cost?: string // Decimal as string
  total_cost?: string // Decimal as string
  reference_number?: string // Order ID, transfer ID, etc.
  notes?: string
  processed_by?: number // Staff user ID
  created_at: string
  // Populated fields from backend
  product_name?: string
  product_type?: "medicine" | "supplement" | "medical_device"
  branch_name?: string
  processed_by_name?: string
}

// Filter interfaces for delivery queries
export interface DeliveryFilters {
  delivery_type?: "pickup" | "home"
  status?: "scheduled" | "in_transit" | "delivered" | "cancelled"
  assigned_staff?: number
  customer?: string
  order?: number
  is_overdue?: boolean
  scheduled_date_from?: string
  scheduled_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// Create delivery request interface
export interface CreateDeliveryRequest {
  order: number
  delivery_type: "pickup" | "home"
  scheduled_date: string
  delivery_address?: string
  delivery_instructions?: string
  assigned_staff?: number
  pickup_location?: string
  estimated_delivery_time?: string
  gps_coordinates?: string
}

// Update delivery request interface
export interface UpdateDeliveryRequest {
  id: number
  delivery_type?: "pickup" | "home"
  status?: "scheduled" | "in_transit" | "delivered" | "cancelled"
  scheduled_date?: string
  delivery_address?: string
  delivery_instructions?: string
  assigned_staff?: number
  pickup_location?: string
  estimated_delivery_time?: string
  gps_coordinates?: string
  customer_notified?: boolean
  delivered_date?: string
}

// Schedule delivery request interface  
export interface ScheduleDeliveryRequest {
  assigned_staff: number
  scheduled_date?: string
  delivery_instructions?: string
  estimated_delivery_time?: string
}

// Filter interfaces for inventory queries
export interface InventoryRecordFilters {
  medicine?: number
  supplement?: number
  medical_device?: number
  branch?: number
  is_low_stock?: boolean
  stock_level_min?: number
  stock_level_max?: number
  expiry_date_before?: string
  expiry_date_after?: string
  supplier?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface InventoryTransactionFilters {
  medicine?: number
  supplement?: number
  medical_device?: number
  branch?: number
  transaction_type?: InventoryTransaction['transaction_type']
  processed_by?: number
  date_from?: string
  date_to?: string
  reference_number?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// Factory Pattern Types
export interface ProductFactory {
  id: number
  factory_name: string
  supported_product_types: string[]
  created_at: string
}

export interface CreateProductFactoryRequest {
  factory_name: string
  supported_product_types: string[]
}

export interface CreateProductRequest {
  type: 'medicine' | 'supplement' | 'medical_device'
  data: CreateMedicineRequest | CreateSupplementRequest | CreateMedicalDeviceRequest
}
