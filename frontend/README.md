# EstateSphere Frontend — React + Vite

A full-featured property management frontend built with **React 19**, **Vite 8**, and **Vanilla CSS** with glassmorphism design. Designed to interface directly with the Django REST Framework backend located in the parent directory.

---

## 🌟 Key Features

### 1. 🔍 Property Catalog & Discovery
* **Search**: Real-time keyword search across title, description, city, and property type.
* **Category Filters**: Instant filtering by Apartments, Condos, Houses, Townhouses, Basements, and Rooms.
* **Location & Status**: Filter by City and availability (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
* **Sorting**: Sort by monthly rent (low-to-high, high-to-low) and bedrooms.
* **Detailed View**: Modal featuring high-resolution photography, property specs, address details, and lease terms.

### 2. 🏢 Landlord Executive Hub
* **Real-Time KPIs**: Track total properties, available units, pending applications, active leases, and open maintenance tickets.
* **Property Management**: List new properties with complete validation matching backend models, and delete or update listings.
* **Application Review**: Review incoming tenant rental applications with one-click **Approve** and **Reject** actions.
* **Lease Tracking**: Overview of tenant agreements, terms, and monthly rental rates.
* **Maintenance Dispatch**: Monitor tenant issues and transition tickets (`OPEN` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
* **Rent Ledger**: View payment receipts, amounts, and transaction references.

### 3. 🔑 Tenant Resident Portal
* **Application Tracker**: Follow the approval status of submitted applications.
* **Active Leases**: Access signed lease details and current monthly charges.
* **Maintenance Tickets**: File requests with custom urgency priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and cancellation options.
* **Rent Payments**: Record payments via Bank Transfer, Credit Card, Debit Card, or Cash with auto-generated receipt IDs.

### 4. ⚡ Seamless Django Integration & Interactive Demo Mode
* **Backend Health Ping**: Automated indicator in the navigation bar checking connection to the Django server.
* **Automatic Proxy**: Dev server proxies `/api/*` to `http://127.0.0.1:8000`.
* **JWT Authentication**: Automatically stores tokens and includes `Authorization: Bearer <token>` on all requests.
* **Interactive Demo Mode**: When the backend is offline, the frontend falls back to persistent local storage with realistic mock properties and pre-configured demo profiles (`Demo Landlord` and `Demo Tenant`).

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm (v9+)

### Installation
From within the `frontend/` directory:
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```
The application will launch at: [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 🔌 Connecting to Django Backend

To connect the frontend to the live Django backend:
1. Ensure your PostgreSQL database is running.
2. In the root directory, start the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
3. Open [http://localhost:3000](http://localhost:3000). The navbar pill will automatically show **Django Live** with a green status indicator.
