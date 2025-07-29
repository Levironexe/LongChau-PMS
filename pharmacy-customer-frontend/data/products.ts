// Comprehensive product data for the pharmacy frontend
export const mockProductsData = [
  // Medicines
  {
    id: 1,
    product_code: "MED001",
    name: "Paracetamol 500mg",
    price: "25000",
    manufacturer: "Teva",
    description: "Pain relief and fever reducer for headaches, muscle aches, and fever",
    product_type: "medicine",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "500mg",
    therapeutic_class: "Pain relief, fever reducer",
    stock: 150,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    product_code: "MED002",
    name: "Amoxicillin 500mg",
    price: "45000",
    manufacturer: "Stella",
    description: "Antibiotic for bacterial infections of respiratory tract, skin, and urinary tract",
    product_type: "medicine",
    requires_prescription: true,
    is_available: true,
    dosage_form: "Capsule",
    strength: "500mg",
    therapeutic_class: "Antibiotic",
    stock: 85,
    image: "https://plus.unsplash.com/premium_photo-1661310059065-2c13701055ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 3,
    product_code: "MED003",
    name: "Ibuprofen 200mg",
    price: "32000",
    manufacturer: "Pfizer",
    description: "Anti-inflammatory pain reliever for arthritis, headaches, and muscle pain",
    product_type: "medicine",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "200mg",
    therapeutic_class: "NSAID",
    stock: 200,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    product_code: "MED004",
    name: "Aspirin 100mg",
    price: "18000",
    manufacturer: "Bayer",
    description: "Low-dose aspirin for heart health and stroke prevention",
    product_type: "medicine",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "100mg",
    therapeutic_class: "Antiplatelet",
    stock: 300,
    image: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 5,
    product_code: "MED005",
    name: "Cetirizine 10mg",
    price: "28000",
    manufacturer: "Johnson & Johnson",
    description: "Antihistamine for allergies, hay fever, and skin reactions",
    product_type: "medicine",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "10mg",
    therapeutic_class: "Antihistamine",
    stock: 120,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop&crop=center"
  },

  // Supplements
  {
    id: 6,
    product_code: "SUP001",
    name: "Vitamin C 1000mg",
    price: "180000",
    manufacturer: "Blackmores",
    description: "High-potency vitamin C supplement for immune support and antioxidant protection",
    product_type: "supplement",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Capsule",
    strength: "1000mg",
    stock: 95,
    image: "https://images.unsplash.com/photo-1556909045-f2c31746f5e0?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 7,
    product_code: "SUP002",
    name: "Vitamin D3 2000 IU",
    price: "220000",
    manufacturer: "Nature Made",
    description: "Essential vitamin D3 for bone health, immune function, and calcium absorption",
    product_type: "supplement",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Softgel",
    strength: "2000 IU",
    stock: 75,
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 8,
    product_code: "SUP003",
    name: "Omega-3 Fish Oil",
    price: "350000",
    manufacturer: "Nordic Naturals",
    description: "Premium omega-3 supplement for heart, brain, and joint health",
    product_type: "supplement",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Softgel",
    strength: "1000mg",
    stock: 60,
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 9,
    product_code: "SUP004",
    name: "Multivitamin Complex",
    price: "250000",
    manufacturer: "Centrum",
    description: "Complete daily multivitamin with essential vitamins and minerals",
    product_type: "supplement",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "Daily",
    stock: 110,
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8d24?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 10,
    product_code: "SUP005",
    name: "Calcium + Magnesium",
    price: "190000",
    manufacturer: "Osteo Bi-Flex",
    description: "Bone health supplement with calcium, magnesium, and vitamin D",
    product_type: "supplement",
    requires_prescription: false,
    is_available: true,
    dosage_form: "Tablet",
    strength: "500mg/250mg",
    stock: 88,
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&h=300&fit=crop&crop=center"
  },

  // Medical Devices
  {
    id: 11,
    product_code: "DEV001",
    name: "Omron Blood Pressure Monitor",
    price: "1200000",
    manufacturer: "Omron",
    description: "Automatic digital blood pressure monitor with large display and memory",
    product_type: "device",
    requires_prescription: false,
    is_available: true,
    stock: 25,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 12,
    product_code: "DEV002",
    name: "Digital Thermometer",
    price: "150000",
    manufacturer: "Braun",
    description: "Fast and accurate digital thermometer with fever indicator",
    product_type: "device",
    requires_prescription: false,
    is_available: true,
    stock: 45,
    image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 13,
    product_code: "DEV003",
    name: "Pulse Oximeter",
    price: "280000",
    manufacturer: "Beurer",
    description: "Fingertip pulse oximeter for measuring blood oxygen levels and pulse rate",
    product_type: "device",
    requires_prescription: false,
    is_available: true,
    stock: 35,
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 14,
    product_code: "DEV004",
    name: "Nebulizer Machine",
    price: "850000",
    manufacturer: "Philips",
    description: "Compact nebulizer for respiratory medication delivery",
    product_type: "device",
    requires_prescription: false,
    is_available: true,
    stock: 18,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 15,
    product_code: "DEV005",
    name: "Glucose Test Strips (50ct)",
    price: "320000",
    manufacturer: "Accu-Chek",
    description: "Blood glucose test strips for diabetes monitoring",
    product_type: "device",
    requires_prescription: false,
    is_available: true,
    stock: 70,
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center"
  },

  // Personal Care & Cosmetics
  {
    id: 16,
    product_code: "COS001",
    name: "Sunscreen SPF 50+",
    price: "165000",
    manufacturer: "La Roche-Posay",
    description: "Broad-spectrum sunscreen for sensitive skin with antioxidants",
    product_type: "cosmetic",
    requires_prescription: false,
    is_available: true,
    stock: 90,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 17,
    product_code: "COS002",
    name: "Moisturizing Lotion",
    price: "125000",
    manufacturer: "CeraVe",
    description: "Daily moisturizing lotion with ceramides and hyaluronic acid",
    product_type: "cosmetic",
    requires_prescription: false,
    is_available: true,
    stock: 65,
    image: "https://images.unsplash.com/photo-1556228578-dd6f681b7dd3?w=400&h=300&fit=crop&crop=center"
  },

  // Mother & Baby
  {
    id: 18,
    product_code: "MB001",
    name: "Baby Formula (Stage 1)",
    price: "450000",
    manufacturer: "Similac",
    description: "Infant formula for newborns 0-6 months with DHA and ARA",
    product_type: "mother-baby",
    requires_prescription: false,
    is_available: true,
    stock: 40,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 19,
    product_code: "MB002",
    name: "Prenatal Vitamins",
    price: "280000",
    manufacturer: "Nature Made",
    description: "Complete prenatal vitamins with folic acid, iron, and DHA",
    product_type: "mother-baby",
    requires_prescription: false,
    is_available: true,
    stock: 55,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 20,
    product_code: "MB003",
    name: "Baby Diapers (Size M)",
    price: "195000",
    manufacturer: "Pampers",
    description: "Premium baby diapers with 12-hour protection and wetness indicator",
    product_type: "mother-baby",
    requires_prescription: false,
    is_available: true,
    stock: 80,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop&crop=center"
  }
];

// Export utility functions
export const getProductsByCategory = (category: string) => {
  if (category === "all") return mockProductsData;
  return mockProductsData.filter(product => product.product_type === category);
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockProductsData.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.manufacturer.toLowerCase().includes(lowercaseQuery)
  );
};

export const getProductById = (id: number) => {
  return mockProductsData.find(product => product.id === id);
};