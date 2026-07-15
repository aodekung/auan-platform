# Auan-Auan-Platform

> System Modules

## Document Information

| Item | Value |
| ---- | ----- |
| Document | System Modules |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines all functional modules within Auan-Auan-Platform.

Every feature must belong to exactly one module.

Modules should remain loosely coupled and highly cohesive.

---

## Design Principles

Modules must follow:

- Single Responsibility Principle
- Separation of Concerns
- Feature-Based Architecture
- Independent Development
- Independent Testing
- Independent Documentation

---

## System Overview

```text
Customer Layer
        ↓
Business Layer
        ↓
ERP Layer
        ↓
AI Layer
```

---

## Customer Modules

### Authentication

Responsibilities:

- LINE Login
- Session Management
- Customer Identity

Features:

- Login
- Logout
- Session Validation

---

### Product Catalog

Responsibilities:

- Product Categories
- Product List
- Product Details
- Product Availability

Features:

- Browse Products
- Search
- Filter

---

### Shopping Cart

Responsibilities:

- Cart Management
- Quantity Management
- Option Selection
- Price Calculation

Features:

- Add Item
- Remove Item
- Update Quantity
- Calculate Total

---

### Checkout

Responsibilities:

- Customer Information
- Address
- Order Summary
- Validation

Features:

- Building Selection
- Room Number
- Delivery Note

---

### Payment

Responsibilities:

- PromptPay QR
- Payment Confirmation
- Payment Status

Features:

- Fixed QR Code
- PromptPay Number
- Payment Countdown

---

### Order Tracking

Responsibilities:

- Current Order Status
- Order History

Features:

- Status Timeline
- Reorder (Future)

---

## Business Modules

### Order Management

Responsibilities:

- Order Processing
- Order Validation
- Status Management

Features:

- View Orders
- Update Status
- Cancel Order

---

### Kitchen Management

Responsibilities:

- Kitchen Queue
- Food Preparation
- Quality Check

Features:

- Kitchen Dashboard
- Queue Management
- Ready Notification

---

### Delivery Management

Responsibilities:

- Delivery Queue
- Address Validation
- Delivery Completion

Features:

- Delivery Status
- Delivery History

---

### Product Management

Responsibilities:

- Product CRUD
- Category Management
- Product Visibility

Features:

- Create Product
- Update Product
- Archive Product

---

### Inventory Management

Responsibilities:

- Stock Control
- Ingredient Tracking
- Low Stock Alert

Features:

- Stock Adjustment
- Inventory History
- Purchase Suggestions

---

### Customer Management

Responsibilities:

- Customer Profiles
- Customer History
- Customer Statistics

Features:

- Customer Search
- Order History
- Spending Summary

---

### Notification Module

Responsibilities:

- Customer Notifications
- Business Notifications

Features:

- LINE Messaging
- Notification History
- Retry Queue

---

## ERP Modules

### Supplier Management

Features:

- Suppliers
- Purchase Orders
- Contacts

---

### Purchasing

Features:

- Purchase Orders
- Receiving
- Purchase History

---

### Recipe Management

Features:

- Recipe Builder
- Ingredient Mapping
- Cost Calculation

---

### Cost Management

Features:

- Food Cost
- Ingredient Cost
- Profit Analysis

---

### Accounting

Features:

- Income
- Expense
- Financial Reports

---

### Employee Management

Features:

- Staff Accounts
- Roles
- Permissions

---

### Branch Management

Features:

- Multi-Branch
- Branch Settings
- Branch Reports

---

## AI Modules

### AI Assistant

Responsibilities:

- Business Assistant
- Operations Support

---

### Sales Forecast

Responsibilities:

- Revenue Prediction
- Demand Forecasting

---

### Inventory Forecast

Responsibilities:

- Stock Prediction
- Purchase Recommendation

---

### Business Analytics

Responsibilities:

- KPI Analysis
- Performance Dashboard

---

## Shared Modules

### Authentication Service

Shared by:

- Customer
- Admin
- Future Staff

---

### File Storage

Responsibilities:

- Images
- Documents

---

### Logging

Responsibilities:

- Error Logs
- Audit Logs
- Activity Logs

---

### Configuration

Responsibilities:

- Environment Variables
- Feature Flags
- System Settings

---

## Module Dependencies

```text
Customer Modules
        ↓
Business Modules
        ↓
Shared Services
        ↓
Database
```

ERP modules extend Business modules.

AI modules consume business data but do not directly modify business logic.

---

## Future Modules

Future additions may include:

- Membership
- Loyalty Program
- Coupon Engine
- Marketing Automation
- CRM
- POS
- Multi-Tenant
- Franchise Management
- BI Dashboard
- AI Copilot

---

## Module Ownership

Each module should have:

- Business Rules
- API
- Database Models
- Documentation
- Tests

Modules should be independently deployable whenever practical.

---

## Definition of Done

A module is complete when:

- Responsibilities are clearly defined.
- Public interfaces are documented.
- Dependencies are minimized.
- Tests are implemented.
- Documentation is complete.
- Future expansion is supported.

---

## References

- `150-business-rules.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `174-api-design.md`
- `176-development-guideline.md`
- `177-testing-strategy.md`
