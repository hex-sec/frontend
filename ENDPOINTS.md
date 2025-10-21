# Endpoint Mapping

Catalog of the API endpoints the current frontend either calls today or expects to call as the MVP hardens. Each entry includes the HTTP method, path, and a short description of why the endpoint exists from a product/feature point of view.

## Authentication & Session

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Exchange credentials for a session (needed for admin, guard kiosk, and resident portals). |
| POST | `/auth/logout` | Terminate active sessions and revoke refresh tokens for security hardening. |
| POST | `/auth/refresh` | Rotate access tokens without forcing the user to re-enter credentials. |
| POST | `/auth/register` | Allow admins to invite new staff or residents into the platform. |
| POST | `/auth/password/reset-request` | Trigger password reset emails to support account recovery. |
| POST | `/auth/password/reset` | Complete password resets once the user provides the token and new password. |

## Sites & Context

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites` | Populate the enterprise dashboard with available communities and basic metadata. |
| GET | `/sites/:slug` | Power the site detail pages with address, contacts, and current health metrics. |
| POST | `/sites` | Enable enterprise admins to onboard new communities. |
| PATCH | `/sites/:slug` | Allow updating site profile info (branding, contact info, access rules). |

## Users & Roles

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/users` | List all role assignments for a site to manage staffing. |
| POST | `/sites/:slug/users` | Invite new guards, residents, or admins to a site. |
| PATCH | `/sites/:slug/users/:userId` | Update role, status, or contact info for an individual. |
| GET | `/users/:userId` | Drive the enterprise user profile page. |

## Residents & Households

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/residents` | Feed the residents directory with search/filterable data. |
| POST | `/sites/:slug/residents` | Support onboarding new households into the system. |
| PATCH | `/sites/:slug/residents/:residentId` | Maintain accurate resident details (vehicles, contact). |

## Residences & Units

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/residences` | Populate the residences table with occupancy, layout, and inspection data. |
| POST | `/sites/:slug/residences` | Create or import new units/villas during onboarding or construction. |
| PATCH | `/sites/:slug/residences/:residenceId` | Update unit status, capacity, and attribute changes. |
| GET | `/sites/:slug/residences/:residenceId/inspections` | Retrieve inspection history for compliance reporting. |

## Visitors & Visits

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/visits` | Power the visit history table and analytics. |
| POST | `/sites/:slug/visits` | Schedule new guest entries from the admin UI or kiosks. |
| PATCH | `/sites/:slug/visits/:visitId/status` | Update visit lifecycle events (arrived, closed, revoked). |
| GET | `/sites/:slug/visitors` | Provide visitor records for repeat access management. |

## Vehicles & Access Control

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/vehicles` | Drive the vehicle registry page for compliance and lookup. |
| POST | `/sites/:slug/vehicles` | Register new vehicles tied to residents or recurring vendors. |
| DELETE | `/sites/:slug/vehicles/:plate` | Remove vehicles no longer approved, ensuring kiosk accuracy. |

## Policies & Compliance

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/policies` | Render guard/admin policy documentation within the UI. |
| PUT | `/sites/:slug/policies` | Allow governance teams to update policy content/versioning. |

## Dashboard Metrics

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/metrics/kpi` | Populate enterprise KPIs (residents, visits, incidents). |
| GET | `/sites/:slug/metrics/operational` | Feed “Estado operativo” cards with live guard activity. |
| GET | `/sites/:slug/alerts` | Surface pending alerts for actionable follow-up. |

## Reporting & Analytics

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sites/:slug/reports/billing` | Fetch daily/monthly billing aggregates used in PDF exports. |
| GET | `/sites/:slug/reports/events` | Provide highlight events and incident counts for reporting. |
| POST | `/reports/export` | Request server-side generation of PDFs/CSVs for long-running datasets. |
| GET | `/reports/history` | List previously generated reports for download/auditing. |

## Billing & Payments

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/billing/invoices` | Drive invoice tables for finance teams across sites. |
| POST | `/billing/invoices` | Create invoices from automated or manual workflows. |
| POST | `/billing/payments/intent` | Initiate Stripe payment intents for portal transactions. |
| POST | `/billing/payments/webhook` | Receive Stripe webhook callbacks and synchronize payment status. |

## Automation & Integrations

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/automation/login/kiosk` | Issue short-lived tokens for guard kiosks with auto-login. |
| POST | `/automation/reports/schedule` | Schedule recurring report generation emails. |
| POST | `/integrations/pms/sync` | Trigger resident/device sync jobs with property management systems. |
| GET | `/integrations/status` | Offer health status for external system connections. |
