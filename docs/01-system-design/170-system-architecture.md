# 170-system-architecture.md

## System Architecture Specification

## Document Information

| Item | Value |
| ---- | ----- |
| Document | System Architecture |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

## 1. Document Purpose

This document defines the overall system architecture for the Auan-Auan-Platform.

The purpose of this document is to:

- Define the high-level system structure
- Establish architecture principles and standards
- Describe system layers and responsibilities
- Provide guidance for developers, architects, and AI coding agents
- Ensure future scalability and maintainability
- Support future AI integration and enterprise expansion

This document is part of:

---

## 2. Architecture Objectives

The system architecture is designed with the following goals.

### 2.1 Scalability

The system must support future growth:

- Increasing number of users
- Increasing transaction volume
- Multiple branches
- Multiple sales channels
- External platform integrations

---

### 2.2 Maintainability

The system should be easy to:

- Understand
- Modify
- Extend
- Test
- Debug

The architecture must minimize:

- Tight coupling
- Duplicate logic
- Unclear responsibilities

---

### 2.3 Security

The system must support:

- Authentication
- Authorization
- Role-based permissions
- Data protection
- Audit logging
- Secure API communication

---

### 2.4 AI-Ready Architecture

The architecture must support future AI capabilities:

- AI Business Assistant
- AI Analytics
- AI Recommendation Engine
- AI Automation
- Knowledge Retrieval System (RAG)
- Natural Language Business Queries

---

## 3. Architecture Pattern

### 3.1 Initial Architecture Approach

The system will use: **Modular Monolith** during the initial development phase.

Reasons:

- Faster development
- Easier deployment
- Lower infrastructure complexity
- Clear module boundaries
- Future migration path to microservices

---

### 3.2 Architecture Evolution

The architecture is designed to evolve from monolith to microservices.

```text
Phase 1: Modular Monolith
        ↓
Phase 2: Event-Driven Modules
        ↓
Phase 3: Microservices (if needed)
```

Evolution is driven by:
- Team size growth
- Deployment isolation needs
- Independent scaling requirements

---

Individual Databases

---

## 4. High-Level System Architecture

```text
LINE Official Account
        ↓
LINE LIFF Application (Customer)
        ↓
API Gateway (Fastify)
        ↓
Application Layer
  ├── Auth Module
  ├── Product Module
  ├── Cart Module
  ├── Order Module
  ├── Payment Module
  ├── Notification Module
  └── Kitchen Module
        ↓
Data Layer (Prisma → PostgreSQL)
```

```
Admin Dashboard (Future)
        ↓
Same API Gateway
```

---

## 5. System Architecture Layers

### 5.1 Presentation Layer

Responsibility

Handles user interaction and user interface rendering.

Components:

- Customer Web Application
- Admin Dashboard
- Staff Interface
- Mobile Application

Responsibilities:

- Display information
- Collect user input
- Client-side validation
- User experience management

Restrictions:

The presentation layer must NOT:

- Access database directly
- Contain core business rules
- Handle complex calculations

### 5.2 API Layer

Responsibility

Provides communication between frontend applications and backend services.

Responsibilities:

- Receive requests
- Validate input
- Authenticate users
- Check permissions
- Return standardized responses

Example:

- GET /api/orders

- POST /api/orders

- PUT /api/orders/{id}

### 5.3 Application Layer

Responsibility

Contains application workflows and service logic.

Main modules:

Application Layer

- Authentication Module
- User Management Module
- Customer Module
- Product Module
- Inventory Module
- Order Module
- Payment Module
- Delivery Module
- Reporting Module
- AI Module

Responsibilities:

- Coordinate business operations
- Execute workflows
- Communicate between modules

### 5.4 Domain Layer

Responsibility

Contains core business logic and business rules.

Example:

Order Domain:

- Create Order
- Validate Order
- Calculate Total
- Change Status
- Complete Order
- Cancel Order

Business rules must remain inside the domain layer.

Business logic should NOT be placed in:

- Frontend
- Controllers
- Database triggers

### 5.5 Data Layer

Responsibility

Handles data persistence.

Components:

- Database
- ORM
- Repository Layer
- Migration System

Responsibilities:

- Database communication
- Query execution
- Transaction handling
- Data migration

## 6. Core System Modules

### 6.1 Authentication Module

Responsibilities:

- User login
- LINE Login verification
- Token management
- Session handling
- JWT token generation

## 6.2 User Management Module

Responsibilities:

- User accounts
- User profiles
- Roles
- Permissions

Supported Roles:

- Owner
- Administrator
- Manager
- Staff
- Customer
- Delivery Rider (Future)
- AI Agent (Future)

### 6.3 Product Module

Responsibilities:

- Product catalog
- Categories
- Pricing
- Product availability
- Product images

### 6.4 Inventory Module

Responsibilities:

- Stock tracking
- Stock movement
- Stock adjustment
- Inventory reports

### 6.5 Order Module

Responsibilities:

- Order creation
- Order processing
- Order status management
- Order history

Related Documents: 158-order-status.md

### 6.6 Payment Module

Responsibilities:

- Payment processing
- Payment verification
- Transaction records
- Refund management

Related Documents: 155-payment-workflow.md

### 6.7 Delivery Module

Responsibilities:

- Delivery assignment
- Delivery tracking
- Delivery status management

### 6.8 Reporting Module

Responsibilities:

- Sales reports
- Business analytics
- Dashboard data
- Performance metrics

### 6.9 AI Module

Responsibilities:

- AI assistant
- Business insights
- Data analysis
- Automation workflows

Future capabilities:

- Sales prediction
- Inventory forecasting
- Customer behavior analysis

## 7. Module Communication Rules

Modules must communicate through defined interfaces.

Example:

Order Module

       |

Order Service Interface

       |

Payment Module

Rules:

- Modules must not directly access other module databases
- Shared logic must be extracted into common services
- Each module owns its own business rules

## 8. Database Architecture

Initial database:

Database
├── users
├── roles
├── permissions
├── customers
├── products
├── inventory
├── orders
├── payments
├── deliveries
└── audit_logs

Database principles:

- Use migrations
- Maintain data integrity
- Use proper indexing
- Avoid unnecessary duplication

## 9. Cache Layer

Redis may be used in future for:

- Session storage
- Frequently accessed data
- Temporary information
- Background job queues

> Note: Current Phase 1 does not use Redis or any caching layer.

Example:
Request

   |

Check Redis

   |

Data Exists?

   |

Return Cache

OR

Query Database

## 10. File Storage Architecture

Used for:

Product images
Payment slips
Documents
Reports

Example:

storage/

├── products/
├── payments/
├── documents/
└── reports/

## 11. External System Integration

The system should support:

Payment Integration

Examples:

- PromptPay
- Payment Gateway

Delivery Integration

Examples:

- Food Delivery Platforms
- Logistics Providers

Notification Integration

Supported channels:

- Email
- SMS
- LINE Notification
- Push Notification

## 12. Security Architecture

### 12.1 Authentication

Supported:

- LINE Login → JWT Token Issuance (see `175-authentication-authorization.md` for full flow)
- Secure Session Management

### 12.2 Authorization

The system uses: RBAC(Role-Based Access Control)
Example:

Owner:

- CREATE
- READ
- UPDATE
- DELETE

Staff:

- CREATE_ORDER
- UPDATE_ORDER_STATUS
- READ_DATA

## 13. Logging and Monitoring

The system must provide:

- Application Logs

Contains:

- Errors
- Warnings
- System events
- Audit Logs

Tracks:

- User actions
- Data changes
- Permission changes

Example:

{
  "user": "admin",
  "action": "UPDATE_ORDER_STATUS",
  "old_status": "PREPARING",
  "new_status": "COMPLETED"
}

## 14. Deployment Architecture

Initial deployment:

User

 |

Cloud Load Balancer

 |

Application Server

 |

Database Server

 |

File Storage

## 15. Development Environment

Development workflow:

Developer Machine

        |

Docker Environment

        |

Local Database

        |

Development API

## 16. CI/CD Architecture

Deployment pipeline:

Developer

    |

Git Commit

    |

Repository

    |

Automated Testing

    |

Build

    |

Deployment

## 17. AI Coding Agent Guidelines

AI coding agents must:

- Read architecture documentation before implementation.
- Follow existing module boundaries.
- Avoid creating duplicate functionality.
- Keep business logic inside proper layers.
- Update documentation when architecture changes.
- Create tests for important features.
- Follow project coding standards.

## 18. Future Architecture Expansion

Future improvements:

- Microservices Migration

Possible separation:

- Order Service
- Payment Service
- Inventory Service
- AI Service
- Notification Service

Event-Driven Architecture

Example:

Order Created

      |

Event Bus

      |

Inventory Update

Payment Notification

AI Analysis

AI-Native Business Platform

Future capabilities:

- Natural language reporting
- Automated decision support
- Intelligent recommendations
- Business workflow automation

## 19. Architecture Principles Summary

- Keep responsibilities separated.
- Business rules belong to domain/application layers.
- Modules must have clear boundaries.
- Security must be built into every layer.
- Every feature must be testable.
- Documentation must stay synchronized with code.
- Architecture must support future business growth.
- AI agents must understand system architecture before generating code.
