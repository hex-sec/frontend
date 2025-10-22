# MVP Roadmap & Backlog

This document captures the feature roadmap and implementation backlog for delivering a fully functional MVP. Items are organized by milestone phase and further split into UI (front-end experience), WS (web services / API), and DB (data model & persistence).

## Phase 0 – Stabilize Foundations

### UI

- [ ] Audit existing layouts for responsiveness and address minor aesthetic defects across breakpoints
- [ ] Standardize typography and spacing tokens in the MUI theme to reduce drift
- [ ] Implement loading and empty states for all current pages (dashboard, visits, residents, reports)
- [ ] Add smoke tests (Playwright/Cypress) for core navigation flows to guard regressions
- [ ] Introduce full-app internationalization with Spanish as the default language and locale-aware formatting
- [ ] Review every enterprise/site page pair to ensure filters (site selector, dates, reports scope) respect mode context and auto-populate when in site mode

### WS

- [ ] Document current API assumptions and define schema contracts for visits, residents, billing, and events
- [ ] Set up environment-specific configuration handling for API base URLs and feature flags
- [ ] Establish error-handling conventions and global retry/backoff utilities for network calls

### DB

- [ ] Produce ERD for existing entities (sites, residents, guards, visits, vehicles, invoices, events)
- [ ] Normalize lookup tables (roles, event types, billing categories) and define seeding scripts
- [ ] Add auditing columns (created_at, updated_at, created_by) to all transactional tables

## Phase 1 – Identity & Access

### UI

- [ ] Build authentication views (login, password reset, onboarding) with proper validation feedback
- [ ] Surface role-based navigation cues and guard content to reflect permissions in the UI
- [ ] Implement session timeout prompts and re-auth flows

### WS

- [ ] Connect to backend authentication endpoints (register, login, refresh token, logout)
- [ ] Introduce OAuth/OpenID support for enterprise single sign-on scenarios
- [ ] Implement token refresh interceptors and global auth guard middleware

### DB

- [ ] Store hashed credentials or external identity provider references securely
- [ ] Track login attempts, MFA status, and session revocation metadata
- [ ] Create tables for API keys/service accounts to support automation and kiosk logins

## Phase 2 – Operational Data & Dashboards

### UI

- [ ] Program dashboard widgets with real metrics (billing totals, visit counts, guard coverage)
- [ ] Add configurable date filters and compare-to-period toggles on dashboard and reports
- [ ] Expand reports area with additional visualizations (trend charts, anomaly callouts)
- [ ] Provide export options (CSV, XLSX) alongside the current PDF generation

### WS

- [ ] Build aggregated billing and event summary endpoints for daily/monthly snapshots
- [ ] Connect front-end reporting views to live data with caching and pagination
- [ ] Expose metrics feeds for dashboard widgets (e.g., revenue trends, gate activity heatmaps)
- [ ] Implement webhook consumers for event/incident ingestion from third-party systems

### DB

- [ ] Optimize billing and event tables with materialized views or summary tables for rapid querying
- [ ] Store report generation history with parameters and generated artifact metadata
- [ ] Add support for time-series storage (e.g., events per hour) to enable trend analytics

## Phase 3 – Payments & Billing Automation

### UI

- [ ] Integrate Stripe-hosted components (payment elements, billing history, saved methods)
- [ ] Allow residents to manage payment preferences and view invoices within the portal
- [ ] Display automated dunning status and recovery progress in the admin UI

### WS

- [ ] Connect to Stripe APIs for payment intent creation, subscription management, and webhooks
- [ ] Automate invoice generation and delivery, including reminder schedule configuration
- [ ] Securely store and rotate Stripe/PCI credentials using a secrets manager

### DB

- [ ] Persist payment transactions with reconciliation status and Stripe references
- [ ] Track billing schedules, dunning actions, and fee structures per site or resident group
- [ ] Record webhook deliveries and processing outcomes for auditability

## Phase 4 – Automation & Integrations

### UI

- [ ] Provide administrative tools to configure automation rules (auto-login kiosks, scheduled reports)
- [ ] Surface automation logs and retry controls in the settings area
- [ ] Add notification center with user-specific alerts (failed syncs, expiring credentials)

### WS

- [ ] Automate guard kiosk logins using device signatures and short-lived tokens
- [ ] Implement scheduled report generation and email delivery workflows
- [ ] Integrate with property management platforms for resident/import syncing
- [ ] Add observability hooks (structured logs, metrics) and service health endpoints

### DB

- [ ] Store automation rule definitions, execution logs, and failure states
- [ ] Maintain device registry for kiosks and trusted terminals
- [ ] Persist integration mappings (external IDs, sync checkpoints, transformation metadata)

## Cross-Cutting Enhancements

- [ ] Establish CI pipelines with linting, unit, and integration test coverage gates
- [ ] Add feature flag framework to roll out new capabilities safely
- [ ] Harden security posture (CSP headers, dependency scanning, SAST/DAST)
- [ ] Produce deployment runbooks and on-call documentation for operational readiness
