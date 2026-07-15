# Auan-Auan-Platform

> Project Context

---

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Project Context    |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the business context, project vision, scope, objectives, and constraints for Auan-Auan-Platform.

It serves as the primary source of truth for understanding **why** the project exists before defining **how** it will be implemented.

All architecture, coding decisions, workflows, and AI behaviors must align with this document.

---

## Project Overview

Auan-Auan-Platform is an AI-first food ordering platform designed for small food businesses.

The initial deployment targets a single restaurant:

> **Auan-Auan Mala Tod**

The long-term objective is to evolve from a simple food ordering application into a complete business management platform.

The platform will gradually include:

- Customer Ordering
- Kitchen Management
- Order Management
- Inventory Management
- ERP
- Sales Dashboard
- Business Analytics
- AI Assistant

The system should remain modular so every future feature can be added without major architectural changes.

---

## Vision

Build a modern, maintainable, and scalable platform that allows small food businesses to operate using enterprise-level software without enterprise-level complexity.

---

## Mission

Create software that is:

- Easy for customers to use
- Easy for store owners to manage
- Easy for developers to maintain
- Easy for AI assistants to understand

---

## Business Goals

Primary goals:

- Reduce ordering mistakes
- Reduce manual communication
- Improve ordering speed
- Improve customer experience
- Reduce operational workload
- Prepare the business for future expansion

Secondary goals:

- Inventory tracking
- Sales reporting
- Cost analysis
- ERP integration
- AI-assisted operations

---

## Initial Scope (Phase 1)

Phase 1 focuses only on customer ordering.

Included:

- LINE Official Account
- LIFF Application
- Product Catalog
- Product Options
- Shopping Cart
- Checkout
- Order Summary
- LIFF Authentication
- PromptPay QR Payment

Not included:

- Third-party Payment Gateway (Omise, Stripe, LINE Pay)
- ERP
- Inventory
- Staff Management
- Delivery Management
- Reporting
- Accounting

---

## Target Users

### Customer

Uses LINE Official Account.

Expected actions:

- Browse menu
- Customize products
- Add items to cart
- Submit an order
- View order summary

---

### Store Owner

Receives incoming orders.

Expected actions:

- Review orders
- Accept or reject orders
- Prepare food

---

### Administrator

Responsible for maintaining the system.

Expected actions:

- Configure menus
- Manage products
- Maintain platform settings

---

## Core Principles

### Customer First

Every feature must improve the customer experience.

Avoid unnecessary steps.

Reduce friction whenever possible.

---

### Simple Before Complex

Always choose the simplest solution that satisfies the requirements.

Avoid over-engineering.

---

### Modular Design

Every module should be replaceable without affecting unrelated parts of the system.

---

### AI-First Development

The project is designed to work alongside AI coding assistants.

Code, documentation, naming, and architecture should be explicit and self-explanatory.

Avoid hidden logic.

---

### Long-Term Maintainability

Maintainability is more important than writing fewer lines of code.

Readable code is preferred over clever code.

---

## Non-Functional Goals

The platform should be:

- Fast
- Responsive
- Mobile-first
- Secure
- Maintainable
- Testable
- Scalable

---

## Supported Platforms

Current:

- Desktop Browser
- Mobile Browser
- LINE In-App Browser (LIFF)

Future:

- Android
- iOS
- Progressive Web App (PWA)

---

## Technology Direction

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

Backend

- Fastify
- TypeScript

Database

- PostgreSQL
- Prisma ORM

Authentication

- LINE Login (LIFF)

---

## Out of Scope

The following are intentionally excluded from Phase 1:

- Multi-store support
- Multi-language support
- Multi-currency
- Third-party marketplace integration
- Delivery routing
- Customer loyalty program
- Membership system
- Coupon engine

These features may be added in future phases.

---

## Success Criteria

Phase 1 is considered successful when:

- Customers can place orders through LINE LIFF.
- Product customization works correctly.
- Shopping cart functions reliably.
- Order summary is accurate.
- Architecture supports future expansion without major refactoring.

---

## Guiding Principle

Every technical decision should answer one question:

> Does this decision make the platform easier to maintain, easier to scale, and easier to understand?

If the answer is no, the decision should be reconsidered.

---

## References

- 00-master-index.md
