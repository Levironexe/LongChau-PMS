// TanStack Query Keys Factory Pattern
// Centralized query key management for type safety and cache invalidation

export interface UserFilters {
  role?: string
  status?: string
  search?: string
}

export interface OrderFilters {
  order_type?: string
  status?: string
  customer_id?: number
  search?: string
}

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

export interface LoyaltyPointsFilters {
  customer?: number
  customer_name?: string
  transaction_reference?: string
  is_expired?: boolean
  points_min?: number
  points_max?: number
  earned_date_after?: string
  earned_date_before?: string
  expiry_date_after?: string
  expiry_date_before?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface ReportFilters {
  report_type?: string
  date_from?: string
  date_to?: string
  search?: string
  branch?: number
  generated_by?: number
  page?: number
  page_size?: number
  ordering?: string
}

export interface PrescriptionFilters {
  search?: string
  status?: "submitted" | "validated" | "dispensed" | "cancelled"
  patient_name?: string
  doctor_name?: string
  prescription_number?: string
  issue_date_from?: string
  issue_date_to?: string
  page?: number
  page_size?: number
  ordering?: string
}

export interface BranchFilters {
  status?: string
  search?: string
}

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
  transaction_type?: string
  processed_by?: number
  date_from?: string
  date_to?: string
  reference_number?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface ProductFilters {
  product_type?: string
  requires_prescription?: boolean
  manufacturer?: string
  search?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
}

export interface MedicineFilters extends ProductFilters {
  dosage_form?: string
  therapeutic_class?: string
  is_prescription?: boolean
  drug_schedule?: string
  active_ingredient?: string
}

export interface SupplementFilters extends ProductFilters {
  supplement_type?: string
  age_group?: string
}

export interface MedicalDeviceFilters extends ProductFilters {
  device_type?: string
  device_class?: string
}

// Query keys factory following TanStack Query best practices
export const queryKeys = {
  // User Management
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters = {}) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
    // Specific role queries
    customers: () => [...queryKeys.users.all, 'customers'] as const,
    pharmacists: () => [...queryKeys.users.all, 'pharmacists'] as const,
    staff: () => [...queryKeys.users.all, 'staff'] as const,
  },

  // Order Management
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: OrderFilters = {}) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
    // Order transitions and processing
    transitions: (id: number) => [...queryKeys.orders.detail(id), 'transitions'] as const,
    total: (id: number) => [...queryKeys.orders.detail(id), 'total'] as const,
  },

  // Delivery Management
  deliveries: {
    all: ['deliveries'] as const,
    lists: () => [...queryKeys.deliveries.all, 'list'] as const,
    list: (filters: DeliveryFilters = {}) => [...queryKeys.deliveries.lists(), filters] as const,
    details: () => [...queryKeys.deliveries.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.deliveries.details(), id] as const,
    // Specialized delivery queries
    pickup: () => [...queryKeys.deliveries.all, 'pickup'] as const,
    home: () => [...queryKeys.deliveries.all, 'home'] as const,
    scheduled: () => [...queryKeys.deliveries.all, 'scheduled'] as const,
    inTransit: () => [...queryKeys.deliveries.all, 'in_transit'] as const,
    delivered: () => [...queryKeys.deliveries.all, 'delivered'] as const,
    cancelled: () => [...queryKeys.deliveries.all, 'cancelled'] as const,
    overdue: () => [...queryKeys.deliveries.all, 'overdue'] as const,
    byStaff: (staffId: number) => [...queryKeys.deliveries.all, 'staff', staffId] as const,
  },

  // Loyalty Points Management
  loyaltyPoints: {
    all: ['loyalty-points'] as const,
    lists: () => [...queryKeys.loyaltyPoints.all, 'list'] as const,
    list: (filters: LoyaltyPointsFilters = {}) => [...queryKeys.loyaltyPoints.lists(), filters] as const,
    details: () => [...queryKeys.loyaltyPoints.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.loyaltyPoints.details(), id] as const,
    // User-specific points
    userPoints: (userId: number) => [...queryKeys.loyaltyPoints.all, 'user', userId] as const,
  },

  // Reports Management
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (filters: ReportFilters = {}) => [...queryKeys.reports.lists(), filters] as const,
    details: () => [...queryKeys.reports.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.reports.details(), id] as const,
    // Report types
    sales: () => [...queryKeys.reports.all, 'sales'] as const,
    staff: () => [...queryKeys.reports.all, 'staff-performance'] as const,
    inventory: () => [...queryKeys.reports.all, 'inventory'] as const,
    prescription: () => [...queryKeys.reports.all, 'prescription'] as const,
    // Statistics
    stats: () => [...queryKeys.reports.all, 'stats'] as const,
    // Date range queries
    dateRange: (startDate: string, endDate: string, reportType?: string) => 
      [...queryKeys.reports.all, 'date-range', startDate, endDate, reportType] as const,
  },

  // Product Management
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: ProductFilters = {}) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
    lowStock: () => [...queryKeys.products.all, 'low-stock'] as const,
  },
  // Product Factory Management
  productFactories: {
    all: ['product-factories'] as const,
    lists: () => [...queryKeys.productFactories.all, 'list'] as const,
    list: () => [...queryKeys.productFactories.lists()] as const,
    details: () => [...queryKeys.productFactories.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.productFactories.details(), id] as const,
    byType: (productType: string) => [...queryKeys.productFactories.all, 'type', productType] as const,
    config: (productType: string) => [...queryKeys.productFactories.all, 'config', productType] as const,
    supportedTypes: () => [...queryKeys.productFactories.all, 'supported-types'] as const,
  },

  // Medicine Management
  medicines: {
    all: ['medicines'] as const,
    lists: () => [...queryKeys.medicines.all, 'list'] as const,
    list: (filters: MedicineFilters = {}) => [...queryKeys.medicines.lists(), filters] as const,
    details: () => [...queryKeys.medicines.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.medicines.details(), id] as const,
    // Specific medicine queries
    prescription: () => [...queryKeys.medicines.all, 'prescription'] as const,
    otc: () => [...queryKeys.medicines.all, 'otc'] as const,
  },

  // Supplement Management
  supplements: {
    all: ['supplements'] as const,
    lists: () => [...queryKeys.supplements.all, 'list'] as const,
    list: (filters: SupplementFilters = {}) => [...queryKeys.supplements.lists(), filters] as const,
    details: () => [...queryKeys.supplements.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.supplements.details(), id] as const,
  },

  // Medical Device Management
  medicalDevices: {
    all: ['medical-devices'] as const,
    lists: () => [...queryKeys.medicalDevices.all, 'list'] as const,
    list: (filters: MedicalDeviceFilters = {}) => [...queryKeys.medicalDevices.lists(), filters] as const,
    details: () => [...queryKeys.medicalDevices.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.medicalDevices.details(), id] as const,
  },

  // Inventory Management
  inventory: {
    all: ['inventory'] as const,
    // Inventory Records
    records: {
      all: () => [...queryKeys.inventory.all, 'records'] as const,
      lists: () => [...queryKeys.inventory.records.all(), 'list'] as const,
      list: (filters: InventoryRecordFilters = {}) => [...queryKeys.inventory.records.lists(), filters] as const,
      details: () => [...queryKeys.inventory.records.all(), 'detail'] as const,
      detail: (id: number) => [...queryKeys.inventory.records.details(), id] as const,
      lowStock: () => [...queryKeys.inventory.records.all(), 'low-stock'] as const,
      byBranch: (branchId: number) => [...queryKeys.inventory.records.all(), 'branch', branchId] as const,
    },
    // Inventory Transactions
    transactions: {
      all: () => [...queryKeys.inventory.all, 'transactions'] as const,
      lists: () => [...queryKeys.inventory.transactions.all(), 'list'] as const,
      list: (filters: InventoryTransactionFilters = {}) => [...queryKeys.inventory.transactions.lists(), filters] as const,
      details: () => [...queryKeys.inventory.transactions.all(), 'detail'] as const,
      detail: (id: number) => [...queryKeys.inventory.transactions.details(), id] as const,
      byType: (transactionType: string) => [...queryKeys.inventory.transactions.all(), 'type', transactionType] as const,
      byBranch: (branchId: number) => [...queryKeys.inventory.transactions.all(), 'branch', branchId] as const,
    },
    // Legacy support
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    lowStock: () => [...queryKeys.inventory.records.lowStock()] as const,
  },

  // Prescription Management
  prescriptions: {
    all: ['prescriptions'] as const,
    lists: () => [...queryKeys.prescriptions.all, 'list'] as const,
    list: (filters: PrescriptionFilters = {}) => [...queryKeys.prescriptions.lists(), filters] as const,
    details: () => [...queryKeys.prescriptions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.prescriptions.details(), id] as const,
    // Specialized prescription queries
    validation: (id: number) => [...queryKeys.prescriptions.detail(id), 'validation'] as const,
    items: (id: number) => [...queryKeys.prescriptions.detail(id), 'items'] as const,
    // Status-specific queries
    pending: () => [...queryKeys.prescriptions.all, 'status', 'submitted'] as const,
    validated: () => [...queryKeys.prescriptions.all, 'status', 'validated'] as const,
    dispensed: () => [...queryKeys.prescriptions.all, 'status', 'dispensed'] as const,
    // Patient and doctor queries
    byPatient: (patientName: string) => [...queryKeys.prescriptions.all, 'patient', patientName] as const,
    byDoctor: (doctorName: string) => [...queryKeys.prescriptions.all, 'doctor', doctorName] as const,
  },

  // Prescription Items Management
  prescriptionItems: {
    all: ['prescription-items'] as const,
    lists: () => [...queryKeys.prescriptionItems.all, 'list'] as const,
    list: (prescriptionId?: number) => prescriptionId 
      ? [...queryKeys.prescriptionItems.lists(), { prescription: prescriptionId }] 
      : [...queryKeys.prescriptionItems.lists()],
    details: () => [...queryKeys.prescriptionItems.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.prescriptionItems.details(), id] as const,
    byPrescription: (prescriptionId: number) => [...queryKeys.prescriptions.items(prescriptionId)] as const,
  },

  branches: {
    all: ['branches'] as const,
    lists: () => [...queryKeys.branches.all, 'list'] as const,
    list: (filters: BranchFilters = {}) => [...queryKeys.branches.lists(), filters] as const,
    details: () => [...queryKeys.branches.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.branches.details(), id] as const,
    staffSummary: (id: number) => [...queryKeys.branches.detail(id), 'staff-summary'] as const,
    configs: () => [...queryKeys.branches.all, 'configs'] as const,
    config: (id: number) => [...queryKeys.branches.configs(), id] as const,
  },
} as const

// Utility function to invalidate related queries
export const getInvalidationKeys = {
  // When user is updated, invalidate all user-related queries
  user: (userId?: number) => [
    queryKeys.users.lists(),
    ...(userId ? [queryKeys.users.detail(userId)] : []),
    queryKeys.loyaltyPoints.lists(), // Users affect loyalty points
    queryKeys.orders.lists(), // Users affect orders
    queryKeys.deliveries.lists(), // Users affect deliveries
  ],

  // When order is updated, invalidate order and related queries
  order: (orderId?: number) => [
    queryKeys.orders.lists(),
    ...(orderId ? [queryKeys.orders.detail(orderId)] : []),
    queryKeys.deliveries.lists(), // Orders affect deliveries
    queryKeys.reports.lists(), // Orders affect reports
  ],

  // When delivery is updated
  delivery: (deliveryId?: number) => [
    queryKeys.deliveries.lists(),
    ...(deliveryId ? [queryKeys.deliveries.detail(deliveryId)] : []),
  ],

  // When loyalty points are updated
  loyaltyPoints: (userId?: number) => [
    queryKeys.loyaltyPoints.lists(),
    queryKeys.users.lists(), // Loyalty points affect user totals
    ...(userId ? [queryKeys.loyaltyPoints.userPoints(userId)] : []),
  ],

  // When reports are generated
  reports: () => [
    queryKeys.reports.lists(),
  ],

  // When branch is updated
  branch: (branchId?: number) => [
    queryKeys.branches.lists(),
    ...(branchId ? [queryKeys.branches.detail(branchId)] : []),
    queryKeys.users.lists(), // Branch changes affect staff assignments
  ],

  // When branch config is updated
  branchConfig: (branchId?: number) => [
    queryKeys.branches.configs(),
    ...(branchId ? [queryKeys.branches.detail(branchId)] : []),
  ],

  // When product is updated
  product: (productId?: number) => [
    queryKeys.products.lists(),
    queryKeys.medicines.lists(),
    queryKeys.supplements.lists(),
    queryKeys.medicalDevices.lists(),
    queryKeys.inventory.lists(),
    ...(productId ? [queryKeys.products.detail(productId)] : []),
  ],

  // When medicine is updated
  medicine: (medicineId?: number) => [
    queryKeys.medicines.lists(),
    queryKeys.products.lists(),
    queryKeys.inventory.lists(),
    queryKeys.medicines.prescription(),
    queryKeys.medicines.otc(),
    ...(medicineId ? [queryKeys.medicines.detail(medicineId)] : []),
  ],

  // When supplement is updated
  supplement: (supplementId?: number) => [
    queryKeys.supplements.lists(),
    queryKeys.products.lists(),
    queryKeys.inventory.lists(),
    ...(supplementId ? [queryKeys.supplements.detail(supplementId)] : []),
  ],

  // When medical device is updated
  medicalDevice: (deviceId?: number) => [
    queryKeys.medicalDevices.lists(),
    queryKeys.products.lists(),
    queryKeys.inventory.lists(),
    ...(deviceId ? [queryKeys.medicalDevices.detail(deviceId)] : []),
  ],

  // When inventory is updated
  inventory: (recordId?: number) => [
    queryKeys.inventory.records.lists(),
    queryKeys.inventory.transactions.lists(),
    queryKeys.inventory.lowStock(),
    queryKeys.products.lowStock(),
    queryKeys.products.lists(),
    queryKeys.medicines.lists(),
    queryKeys.supplements.lists(),
    queryKeys.medicalDevices.lists(),
    ...(recordId ? [queryKeys.inventory.records.detail(recordId)] : []),
  ],

  // When inventory transaction is updated
  inventoryTransaction: (transactionId?: number) => [
    queryKeys.inventory.transactions.lists(),
    queryKeys.inventory.records.lists(),
    queryKeys.inventory.lowStock(),
    ...(transactionId ? [queryKeys.inventory.transactions.detail(transactionId)] : []),
  ],

  // When prescription is updated
  prescription: (prescriptionId?: number) => [
    queryKeys.prescriptions.lists(),
    queryKeys.prescriptions.pending(),
    queryKeys.prescriptions.validated(),
    queryKeys.prescriptions.dispensed(),
    queryKeys.prescriptionItems.lists(),
    queryKeys.orders.lists(), // Prescriptions may create orders
    ...(prescriptionId ? [
      queryKeys.prescriptions.detail(prescriptionId),
      queryKeys.prescriptions.items(prescriptionId),
      queryKeys.prescriptionItems.byPrescription(prescriptionId),
    ] : []),
  ],

  // When prescription item is updated
  prescriptionItem: (prescriptionId?: number, itemId?: number) => [
    queryKeys.prescriptionItems.lists(),
    ...(prescriptionId ? [
      queryKeys.prescriptions.detail(prescriptionId),
      queryKeys.prescriptions.items(prescriptionId),
      queryKeys.prescriptionItems.byPrescription(prescriptionId),
    ] : []),
    ...(itemId ? [queryKeys.prescriptionItems.detail(itemId)] : []),
  ],
}