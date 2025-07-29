# Long Chau Pharmacy Management System - Staff Frontend

A modern, comprehensive pharmacy management system designed for Long Chau pharmacy chain, featuring multi-branch inventory management, central warehouse control, and complete business operations management.

## 🏥 Overview

This system provides a complete solution for managing pharmacy chain operations, from individual branch inventory to centralized warehouse distribution. Built with modern web technologies and designed for scalability and ease of use.

## ✨ Key Features

### 🏪 **Multi-Branch Management**
- Manage multiple pharmacy locations from a single interface
- Branch-specific inventory and operations
- Centralized warehouse with distribution control
- Store status management and operational hours

### 📦 **Comprehensive Inventory System**
- **Branch-Focused Flow**: Choose branch → Manage branch inventory → Request stock when low
- **Warehouse Management**: Central inventory control with stock allocation
- **Transfer System**: Track stock movements from warehouse to branches
- **Smart Alerts**: Automatic low stock notifications and reorder suggestions

### 🛒 **Complete Business Operations**
- **Product Management**: Full catalog with categories, prescriptions, and suppliers
- **Customer Management**: VIP system, order history, and relationship tracking
- **Order Processing**: Complete workflow from cart to fulfillment
- **Staff Management**: Role-based permissions and employee tracking

### 🎯 **Internal Workflow**
- **Stock Requests**: Branches can request inventory from warehouse
- **Priority System**: Urgent, High, Normal, Low priority handling
- **Approval Workflow**: Warehouse managers approve and fulfill requests
- **Transfer Tracking**: Complete audit trail of stock movements

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmacy-staff-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Technology Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### State Management
- **React Query (@tanstack/react-query)** - Server state management
- **React Hooks** - Local state management

### UI Components
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible component primitives
- **Class Variance Authority** - Component variant management

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing

## 📁 Project Structure

```
pharmacy-staff-frontend/
├── app/                          # Next.js 14 App Router
│   ├── customers/               # Customer management
│   ├── inventory/               # Branch inventory management
│   ├── orders/                  # Order processing
│   ├── products/                # Product catalog
│   ├── staff/                   # Staff management
│   ├── stores/                  # Branch/store management
│   ├── warehouse/               # Central warehouse
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard home
│   └── providers.tsx            # App providers
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard-header.tsx     # Navigation header
│   └── dashboard-sidebar.tsx    # Navigation sidebar
├── lib/                         # Utilities and configs
│   ├── api.ts                   # API configuration
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
├── CLAUDE.md                    # AI development context (not in git)
├── PROGRESSION.md               # Development progress tracking
└── README.md                    # This file
```

## 🔄 User Workflows

### Branch Manager Workflow
1. **Select Branch** - Choose which pharmacy location to manage
2. **View Inventory** - See branch-specific stock levels
3. **Manage Operations** - Handle customers, orders, and staff
4. **Request Stock** - Request inventory from warehouse when low

### Warehouse Manager Workflow
1. **Monitor Inventory** - View central warehouse stock levels
2. **Process Requests** - Review and approve branch stock requests
3. **Manage Transfers** - Create and track deliveries to branches
4. **Allocate Resources** - Distribute inventory across branches

### System Administrator Workflow
1. **Manage Stores** - Add/edit pharmacy branch locations
2. **Staff Management** - Assign roles and permissions
3. **System Overview** - Monitor all operations across branches
4. **Analytics** - Review performance and business metrics

## 🎨 Design System

### Color Scheme
- **Primary**: Blue theme for Long Chau branding
- **Success**: Green for completed actions and positive metrics
- **Warning**: Orange for alerts and low stock notifications
- **Error**: Red for urgent issues and critical alerts

### Typography
- **Headers**: Bold, clear hierarchy
- **Body**: Readable font sizes with proper contrast
- **Data**: Monospace for numbers and codes

### Components
- **Consistent spacing** using Tailwind's spacing system
- **Accessible design** with proper contrast and focus states
- **Responsive layout** working on desktop, tablet, and mobile
- **Loading states** and error handling throughout

## 📊 Business Logic

### Inventory Management
- **Branch-Level**: Each branch manages its own inventory
- **Central Control**: Warehouse has oversight of all inventory
- **Stock Requests**: Automated low-stock detection and request system
- **Transfer Tracking**: Complete audit trail of stock movements

### User Roles
- **Admin**: Full system access
- **Pharmacist**: Clinical and inventory management
- **Manager**: Branch operations and staff management
- **Technician**: Inventory and order support
- **Cashier**: Order processing and customer service

### Data Flow
1. **Branch** identifies low stock
2. **Request** sent to warehouse with priority level
3. **Warehouse** reviews and approves/rejects
4. **Transfer** created and tracked until delivery
5. **Branch** receives stock and updates inventory

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code consistency
- **Component patterns** for reusability
- **Error boundaries** for graceful error handling

### Mock Data
Currently using mock data for development. All data structures are designed to easily connect to real APIs when backend is ready.

## 🚧 Current Status

**Phase**: Core Features Complete (v1.0)  
**Status**: Ready for backend integration  
**Next**: Authentication system and real API connections

### Completed Modules
✅ Dashboard and Navigation  
✅ Store Management  
✅ Product Catalog  
✅ Customer Management  
✅ Order Processing  
✅ Staff Management  
✅ Branch Inventory  
✅ Warehouse Management  
✅ Stock Request System  

### Upcoming Features
🔄 Authentication & Authorization  
🔄 Real API Integration  
🔄 Analytics Dashboard  
🔄 Advanced Reporting  
🔄 Notification System  

## 📞 Support

For development questions or issues:
1. Check the `PROGRESSION.md` file for current status
2. Review the `CLAUDE.md` file for detailed technical context (if available)
3. Check the project issues and documentation

## 📄 License

This project is proprietary software for Long Chau Pharmacy chain.

---

**Built with ❤️ for Long Chau Pharmacy Management**
