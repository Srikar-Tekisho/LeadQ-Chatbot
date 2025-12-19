# Frontend-to-Backend Integration Log & Reference

This document provides a comprehensive reference for the current state of frontend-to-backend integration across the dashboard. It details user entry points, API invocations, data structures, and the current implementation status (fully integrated, partially integrated, or mocked) to guide backend development.

## 1. Profile Section (`ProfileSection.tsx`)

**Status:** ✅ **Fully Integrated**

This section manages the user's personal profile and company details. It performs CRUD operations on two Supabase tables: `profiles` and `companies`.

### Integration Details

| Feature | Entry Point/Interaction | API Action | Request/Payload Structure | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Load Profile** | Page Load (`useEffect`) | `SELECT` from `profiles`, `companies` | `GET /profiles?id=eq.{user_id}`<br>`GET /companies?owner_id=eq.{user_id}` | Fetches user profile first. If found, fetches company profile. |
| **Update Personal Info** | "Save" button in Personal Information card | `UPDATE` `profiles` | ```json { "full_name": "string", "email": "string", "phone": "string", "location": "string", "language": "string", "tone": "string" } ``` | Updates row where `id` = current user ID. |
| **Create Profile** | "Create Profile" button (First time user) | `UPSERT` `profiles`<br>`INSERT` `companies` | **Profile:** Same as Update + `id: user_uuid`<br>**Company:** `{ "owner_id": "user_uuid", "name": "...", "website": "...", "address": "...", "intro": "..." }` | Used when `hasProfile` is false. |
| **Update Company Info** | "Save" button in Company Profile card | `UPDATE` `companies` | ```json { "name": "string", "website": "string", "address": "string", "intro": "string" } ``` | Updates row where `owner_id` = current user ID. |

### Data Structures

**Table: `profiles`**
- `id` (uuid, PK): Matches Auth User ID
- `full_name` (text)
- `email` (text)
- `phone` (text)
- `location` (text)
- `language` (text)
- `tone` (text)
- `updated_at` (timestamp)

**Table: `companies`**
- `id` (uuid, PK)
- `owner_id` (uuid, FK to auth.users)
- `name` (text)
- `website` (text)
- `address` (text)
- `intro` (text)

---

## 2. Notifications Section (`NotificationsAboutSection.tsx`)

**Status:** ✅ **Fully Integrated**

Manages user preferences for push notifications and email alerts. Settings are persisted per user.

### Integration Details

| Feature | Entry Point/Interaction | API Action | Request/Payload Structure | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Load Settings** | Page Load (`useEffect`) | `SELECT` from `notification_settings` | `GET /notification_settings?user_id=eq.{user_id}` | Loads toggles and timer configurations. |
| **Save Preferences** | "Save Preferences" button | `UPSERT` `notification_settings` | ```json { "user_id": "user_uuid", "push_enabled": boolean, "meeting_reminders": boolean, "account_alerts": boolean, "system_announcements": boolean, "product_updates": boolean, "timers": [number] } ``` | Uses upsert to handle both first-time creation and updates. |

### Data Structures

**Table: `notification_settings`**
- `user_id` (uuid, PK): Matches Auth User ID
- `push_enabled` (boolean)
- `meeting_reminders` (boolean)
- `account_alerts` (boolean)
- `system_announcements` (boolean)
- `product_updates` (boolean)
- `timers` (jsonb/array of integers): e.g., `[15, 60]`
- `updated_at` (timestamp)

---

## 3. Help & Support / About (`NotificationsAboutSection.tsx`)

**Status:** ⚠️ **Partially Integrated**

Handles ticket and feedback submissions. The Chatbot is currently **simulated** (client-side specific).

### Integration Details

| Feature | Entry Point/Interaction | API Action | Request/Payload Structure | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Submit Ticket** | "Raise a Ticket" tab > "Submit Ticket" button | `INSERT` into `support_tickets` | ```json { "user_id": "user_uuid", "category": "Technical|Billing|Feature", "priority": "Low|Medium|High|Urgent", "subject": "string", "description": "string" } ``` | |
| **Submit Feedback** | "Feedback" tab > "Submit Feedback" button | `INSERT` into `feedback_submissions` | ```json { "user_id": "user_uuid", "topic": "General|UI/UX|...", "message": "string" } ``` | |
| **Chatbot** | "Contact Support" / Chat Overlay | **NONE** (Client-side Simulation) | N/A | Current responses are hardcoded in `KNOWLEDGE_BASE`. **Backend Needed:** RAG endpoint accepting `{ query: string }`. |

---

## 4. Billing & Pricing (`BillingPricingSection.tsx`)

**Status:** ⚠️ **Partially Integrated**

Invoices are fetched from the backend. Usage credits, pricing plans, and payment methods are currently **static/mocked**.

### Integration Details

| Feature | Entry Point/Interaction | API Action | Request/Payload Structure | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **View Invoices** | "Billing Settings" tab load | `SELECT` from `invoices` | `GET /invoices?user_id=eq.{user_id}` | Filters by user ID, orders by date descending. |
| **Usage/Credits** | "Credits Usage" tab | **NONE** (Static) | N/A | **Backend Needed:** Endpoint to fetch current usage limits and balance. |
| **Pricing Plans** | "Pricing Plans" tab | **NONE** (Static) | N/A | **Backend Needed:** Endpoint for available plans and current subscription status. |
| **Payment Methods**| "Billing Settings" tab | **NONE** (Static) | N/A | **Backend Needed:** CRUD for payment methods (likely via Stripe/Payment Provider integration). |

### Data Structures

**Table: `invoices`** (Read-Only on Frontend)
- `id` (uuid)
- `user_id` (uuid)
- `invoice_date` (timestamp)
- `amount` (numeric)
- `status` (text): 'Paid', 'Pending', etc.
- `pdf_url` (text): URL to download the invoice.

---

## 5. Security (`SecuritySection.tsx`)

**Status:** ❌ **Mocked (Visual Only)**

All security features are UI logic only and do not persist data.

### Missing Integrations
*   **Change Password**: Needs endpoint to trigger password reset or update password (e.g., `supabase.auth.updateUser`).
*   **2FA Toggle**: Needs backend state storage and 2FA setup flow (QR code generation, verification).

---

## 6. Admin Section (`AdminSection.tsx`)

**Status:** ❌ **Mocked (Visual Only)**

Contains administrative controls like session management and data retention. Current implementation uses local state.

### Missing Integrations
*   **Active Sessions**: Needs endpoint to fetch active sessions (device, IP, last active) from Auth provider.
*   **Logout Device**: Needs endpoint to revoke specific session tokens.
*   **Logout All**: Needs endpoint to revoke all tokens except current.
*   **Data Retention**: Needs a settings table/column to store retention policy preferences.
*   **Export/Delete Account**: Needs endpoints to trigger data export jobs or account deletion workflows.

---

## 7. Referral (`ReferralSection.tsx`)

**Status:** ❌ **Mocked (Visual Only)**

Displays referral stats and code. currently uses hardcoded constants.

### Missing Integrations
*   **Stats**: Endpoint to fetch total earnings, monthly growth, and referral count.
*   **Referral Code**: Endpoint to fetch the user's unique referral code.
*   **History**: Endpoint to fetch list of referred users and their conversion status.

---

## 8. Authentication & Authorization

*   **Auth Provider**: Supabase Auth.
*   **Current User**: Retrieved via `supabase.auth.getUser()`.
*   **Protection**: Most actions check `if (!user) return` or throw "Not authenticated" errors.
*   **Role Management**: `userRole` prop is passed down from `App.tsx` (determined by `profiles` or logic not visible in section files).
    *   *Note*: Role-based access control (RBAC) is implemented effectively in the UI (hiding/showing Admin sections), but backend Row Level Security (RLS) policies must be verified to match these frontend rules.
