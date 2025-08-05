# 🏥 Long Châu Pharmacy Management System - Staff Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/React%20Query-5.0-red)](https://tanstack.com/query)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38bdf8)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-29.0-green)](https://jestjs.io/)

A comprehensive, modern pharmacy management system frontend built for Long Châu pharmacy staff operations. This application provides a complete solution for managing customers, orders, inventory, prescriptions, deliveries, and reporting with real-time data visualization and advanced caching strategies.

## 🌟 Features

### 📊 **Comprehensive Dashboard**
- Real-time revenue tracking with interactive charts
- Order management with status visualization
- Inventory status monitoring with low stock alerts
- Customer analytics and VIP management
- Staff performance metrics

### 👥 **Advanced User Management**
- **Role-Based Access Control (RBAC)** - Customers, pharmacists, managers, cashiers, technicians
- **VIP Customer Program** - Automatic upgrades with benefits tracking
- **Factory Pattern Integration** - Streamlined user creation with predefined settings
- **User Statistics** - Demographics, activity tracking, and performance analytics

### 🛒 **Sophisticated Order Management**
- **Unified Order System** - Prescription, in-store, and online orders
- **State Pattern Implementation** - Safe status transitions with validation
- **Strategy Pattern Processing** - Type-specific order handling
- **Real-time Order Tracking** - Live status updates and notifications

### 💊 **Product & Inventory Management**
- **Multi-Category Products** - Medicines, supplements, medical devices
- **Prescription vs OTC Management** - Regulatory compliance built-in
- **Low Stock Monitoring** - Automated alerts and reorder suggestions
- **Branch-Specific Inventory** - Multi-location stock tracking
- **Transaction History** - Complete audit trail for all stock movements

### 📋 **Prescription Processing**
- **Pharmacist Validation Workflow** - Professional prescription review
- **Prescription Item Management** - Detailed medication tracking
- **Status-Based Processing** - Submitted → Validated → Dispensed
- **Doctor & Patient Integration** - Complete prescription history

### 🚚 **Delivery Management**
- **Unified Delivery System** - Pickup and home delivery support
- **Staff Assignment** - Optimized delivery route management
- **Real-time Status Tracking** - Customer notification integration
- **Delivery Analytics** - Performance metrics and optimization

### 🎁 **Loyalty Points System**
- **Points Accumulation** - Automatic point awards for purchases
- **Expiry Management** - Time-based point expiration
- **Customer Rewards** - Integrated discount system
- **Transaction Tracking** - Complete loyalty audit trail

### 📈 **Advanced Reporting & Analytics**
- **Interactive Charts** - Revenue trends, order analytics, inventory status
- **Report Generation** - Sales, staff performance, inventory, prescription reports
- **Real-time Statistics** - Live dashboard metrics
- **Data Export** - Multiple format support for analysis

### 🏢 **Multi-Branch Operations**
- **Branch Management** - Complete branch configuration
- **Staff Allocation** - Role-based staff assignment per branch
- **Branch-Specific Analytics** - Performance comparison across locations
- **Configuration Management** - Branch-specific settings and preferences

## 🚀 Technology Stack

### **Frontend Framework**
- **Next.js 14** - React framework with App Router and server-side rendering
- **React 18** - Latest React with concurrent features
- **TypeScript 5.0** - Full type safety throughout the application

### **State Management & API**
- **TanStack Query (React Query 5.0)** - Intelligent data fetching and caching
- **Axios** - HTTP client with interceptors and error handling
- **Custom Hooks Architecture** - Reusable API integration patterns

### **Styling & UI**
- **Tailwind CSS 3.0** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Modern icon system
- **Recharts** - Interactive data visualization

### **Data Visualization**
- **Recharts** - Professional charts and graphs
- **Custom Chart Components** - Revenue, orders, inventory, and performance charts
- **Real-time Updates** - Live data visualization with automatic refresh

### **Testing & Quality**
- **Jest 29** - Comprehensive testing framework
- **React Testing Library** - Component and integration testing
- **MSW (Mock Service Worker)** - API mocking for realistic testing
- **70+ Test Suites** - Complete coverage of hooks, services, and components

### **Performance & Optimization**
- **Intelligent Caching** - Multi-tier caching strategy with React Query
- **Code Splitting** - Route-based and component-based lazy loading
- **Bundle Optimization** - Optimized for production deployment
- **Web Vitals Monitoring** - Performance tracking and optimization

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- Access to Long Châu PMS API backend

### **Quick Start**

```bash
# Clone the repository
git clone <repository-url>
cd pharmacy-staff-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment
# Edit .env.local with your API endpoints
NEXT_PUBLIC_API_URL=https://longchau-pms.onrender.com/api

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### **Environment Configuration**

Create `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://longchau-pms.onrender.com/api

# Feature Flags
NEXT_PUBLIC_ENABLE_FACTORY_PATTERNS=true
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # CI/CD optimized testing

# Analysis
npm run analyze      # Bundle size analysis
npm run lighthouse   # Performance audit
```

## 📁 Project Structure

```
pharmacy-staff-frontend/
├── app/                    # Next.js 14 App Router pages
│   ├── page.tsx           # Dashboard home page
│   ├── customers/         # Customer management
│   ├── orders/           # Order processing
│   ├── inventory/        # Stock management
│   ├── prescriptions/    # Prescription handling
│   ├── deliveries/       # Delivery tracking
│   ├── reports/          # Analytics & reporting
│   └── branches/         # Multi-branch management
├── components/            # Reusable UI components
│   ├── ui/               # Radix UI components
│   ├── charts/           # Chart components
│   └── dashboard-*.tsx   # Dashboard-specific components
├── hooks/                # Custom React hooks
│   └── api/              # API integration hooks
├── lib/                  # Utility libraries
│   ├── services/         # API service functions
│   ├── types.ts          # TypeScript definitions
│   ├── api.ts            # Axios configuration
│   └── queryKeys.ts      # React Query key factory
├── docs/                 # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── TESTING_GUIDE.md
│   └── PERFORMANCE_GUIDE.md
├── __tests__/            # Test suites
│   ├── services/         # Service layer tests
│   ├── hooks/            # Custom hooks tests
│   ├── integration/      # Integration tests
│   └── utils/            # Test utilities
└── public/               # Static assets
```

## 🔌 API Integration

### **Backend Integration**
- **Base URL**: `https://longchau-pms.onrender.com/api`
- **Authentication**: Token-based authentication
- **Format**: RESTful JSON APIs
- **CORS**: Configured for development and production

### **Key API Endpoints**
```
Users:          GET|POST /users/
Orders:         GET|POST /orders/
Products:       GET|POST /medicines/, /supplements/, /medical-devices/
Inventory:      GET|POST /inventory-records/
Prescriptions:  GET|POST /prescriptions/
Deliveries:     GET|POST /deliveries/
Reports:        GET|POST /reports/
Branches:       GET|POST /branches/
```

### **Service Layer Architecture**
All API calls are abstracted through service functions in `lib/services/`:
- Type-safe request/response handling
- Automatic error handling and retries
- Consistent data transformation
- Centralized request configuration

### **React Query Integration**
Smart caching and state management:
- Automatic background synchronization
- Optimistic updates for mutations
- Hierarchical cache invalidation
- Loading and error state management

## 🧪 Testing Strategy

### **Comprehensive Test Coverage**
- **Unit Tests**: Service functions and utilities
- **Integration Tests**: Component + API integration
- **Hook Tests**: Custom React Query hooks
- **E2E Tests**: Critical user workflows

### **Testing Technologies**
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking for realistic tests
- **User Event**: User interaction simulation

### **Running Tests**
```bash
# Full test suite
npm test

# Coverage report
npm run test:coverage

# Specific test categories
npm test -- __tests__/services/
npm test -- __tests__/hooks/
npm test -- __tests__/integration/
```

## 🚀 Deployment

### **Vercel Deployment (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### **Production Build**
```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run start
```

### **Environment Variables for Production**
```env
NEXT_PUBLIC_API_URL=https://longchau-pms.onrender.com/api
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENVIRONMENT=production
```

## 📊 Performance Metrics

### **Current Performance Stats**
- **Bundle Size**: 87.9kB shared JavaScript
- **First Load**: ~262kB for dashboard
- **Lighthouse Score**: 95+ performance
- **Core Web Vitals**: All metrics in green
- **Test Coverage**: 70%+ across all modules

### **Optimization Features**
- Intelligent caching with React Query
- Code splitting and lazy loading
- Image optimization with Next.js
- Bundle analysis and tree shaking
- Performance monitoring and analytics

## 🔧 Configuration

### **React Query Configuration**
```typescript
// Optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 30 * 60 * 1000,   // 30 minutes
      refetchOnWindowFocus: true,
      retry: 3
    }
  }
})
```

### **TypeScript Configuration**
- Strict mode enabled
- Path mapping for clean imports
- Full type coverage for API responses
- Custom type definitions for business logic

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper TypeScript types
4. Add comprehensive tests
5. Run linting and tests: `npm run lint && npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### **Code Standards**
- **TypeScript**: Strict typing required
- **ESLint**: Zero warnings policy
- **Testing**: All new features must include tests
- **Documentation**: Update docs for API changes

### **Commit Convention**
```
feat: add new feature
fix: bug fix
docs: documentation update
test: add tests
refactor: code refactoring
perf: performance improvement
```

## 📚 Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API integration guide
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing strategies and examples  
- **[Performance Guide](docs/PERFORMANCE_GUIDE.md)** - Optimization and caching strategies
- **[CLAUDE.md](CLAUDE.md)** - Development partnership guidelines

## 🐛 Troubleshooting

### **Common Issues**

1. **API Connection Issues**
   ```bash
   # Check API URL configuration
   echo $NEXT_PUBLIC_API_URL
   
   # Test API connectivity
   curl https://longchau-pms.onrender.com/api/users/
   ```

2. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Run type checking
   npm run type-check
   
   # Generate fresh types
   npm run build
   ```

### **Performance Issues**
- Check React Query DevTools for cache misses
- Use browser DevTools to profile components
- Analyze bundle size with webpack analyzer
- Monitor Web Vitals in production

## 📄 License

This project is proprietary software developed for Long Châu Pharmacy. All rights reserved.

## 🙋‍♂️ Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

## 🎯 Project Status

**Current Version**: 2.0.0
**Status**: Production Ready ✅
**Last Updated**: August 2024

### **Completed Phases**
- ✅ Phase 1-12: Complete API Integration
- ✅ Phase 13: Dashboard & UI Improvements
- ✅ Phase 14: Testing & Quality Assurance  
- ✅ Phase 15: Documentation & Deployment Preparation

### **Key Achievements**
- 🏆 **100% TypeScript Coverage** - Full type safety
- 🏆 **70+ Test Suites** - Comprehensive testing
- 🏆 **Real-time Charts** - Interactive data visualization
- 🏆 **Multi-Branch Support** - Scalable architecture
- 🏆 **Production Ready** - Optimized for deployment

Built with ❤️ for Long Châu Pharmacy Management System