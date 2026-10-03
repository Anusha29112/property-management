# Property Management Platform

A modern full-stack property management platform built for managing properties, landlords, tenants, rental applications, leases, maintenance requests, property images, and payments.

The platform consists of a **Django REST Framework + PostgreSQL** backend and a **React + Vite** single-page frontend with role-based access for Admins, Landlords, and Tenants.

---

## Tech Stack & Architecture

### Backend
* **Python & Django** (Django 6.x)
* **Django REST Framework (DRF)**
* **PostgreSQL** relational database
* **SimpleJWT** for stateless JWT authentication
* **django-filter** for search, filtering, and sorting
* **Git & GitHub** for version control

### Frontend
* **React 19** + **Vite** (JavaScript, ES Modules)
* **Vanilla CSS** with design tokens, glassmorphism, responsive CSS grid, and animations
* **Lucide React** icons
* **Vite Proxy** configured to route `/api/*` requests to the Django backend
* **Centralized API Client** with automatic JWT Bearer token attachment and error parsing

### System Architecture

```text
┌────────────────────────────────┐        HTTP / JSON         ┌────────────────────────────────┐
│      React + Vite Frontend     │ ◄────────────────────────► │     Django REST Framework      │
│      http://localhost:3000     │      Vite Dev Proxy        │     http://127.0.0.1:8000      │
│                                │   (Target: 127.0.0.1:8000) │                                │
│ • Role-Based Navigation        │                            │ • JWT Authentication           │
│ • Property Explore & Filter    │                            │ • Property Catalog API         │
│ • Landlord Executive Hub       │                            │ • Rental Applications API      │
│ • Tenant Resident Portal       │                            │ • Lease Management API         │
│ • System & API Contract Map    │                            │ • Maintenance Tickets API      │
│ • Modals & Toast Alerts        │                            │ • Payment Ledger API           │
└────────────────────────────────┘                            │ • Landlord Analytics API       │
                                                              └──────────────┬─────────────────┘
                                                                             │
                                                                             ▼
                                                              ┌────────────────────────────────┐
                                                              │      PostgreSQL Database       │
                                                              │     (property_management)      │
                                                              └────────────────────────────────┘
```

---

## User Roles & Capabilities

### Admin
* Superuser access to Django Administration (`/admin/`) to manage all database records.
* System monitor access in the React frontend (`/api/admin-test/`) to verify JWT context and API health.
* Global permissions to view, edit, or delete any property listing.

### Landlord
* **Portfolio Management**: Create, edit, and delete properties (`/api/properties/`).
* **Property Images**: Attach image URLs with captions to owned properties (`/api/properties/<id>/images/`).
* **Application Review**: View incoming rental applications (`/api/landlord/applications/`) and approve or reject them (`PATCH /api/landlord/applications/<id>/`).
* **Lease Issuance**: Issue legally binding leases from approved applications (`POST /api/leases/`), and end or terminate active leases (`PATCH /api/leases/<id>/`).
* **Maintenance Dispatch**: View tickets on owned properties (`/api/maintenance-requests/`), adjust priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and update ticket status (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
* **Rent Ledger**: Monitor tenant payments associated with their leases (`/api/payments/`).
* **Executive Dashboard**: Real-time aggregated metrics (`/api/landlord/dashboard/`) displaying total properties, available units, rented units, pending applications, active leases, and open maintenance requests.

### Tenant
* **Property Search & Discovery**: Browse verified listings with real-time keyword search, city filter, property type chips, status filter, and rent/bedroom sorting with backend pagination.
* **Rental Applications**: Submit applications with personalized cover notes for available units (`POST /api/rental-application/`) and track application statuses (`PENDING`, `APPROVED`, `REJECTED`).
* **Lease Agreements**: View active and historical leases with landlord info, lease terms, and monthly rent (`GET /api/leases/`).
* **Maintenance Requests**: Submit repair requests with urgency levels for currently rented properties (`POST /api/maintenance-requests/`) and cancel open tickets (`PATCH /api/maintenance-requests/<id>/`).
* **Rent Payments**: Submit payments against active leases with payment method (`BANK_TRANSFER`, `CREDIT_CARD`, `DEBIT_CARD`, `CASH`) and transaction reference codes (`POST /api/payments/`).

---

## Database Relationships

```text
User
 │
 ├── Profile (Role: ADMIN, LANDLORD, TENANT; Phone)
 │
 ├── Properties (as Landlord / Owner)
 │
 ├── Rental Applications (as Tenant)
 │
 ├── Leases (as Tenant or Landlord)
 │
 ├── Maintenance Requests (as Tenant)
 │
 └── Payments (as Tenant)


Property
 │
 ├── Rental Applications
 ├── Leases
 ├── Maintenance Requests
 └── Property Images


RentalApplication
 │
 └── Lease (One-to-One created upon approval)


Lease
 │
 └── Payments
```

---

## Project Structure

```text
property-management/
│
├── config/
│   ├── settings.py           # Django settings (JWT, DB, apps)
│   ├── urls.py               # Root URL configuration (/api/ and /admin/)
│   ├── asgi.py
│   └── wsgi.py
│
├── properties/
│   ├── migrations/           # Database migrations
│   ├── admin.py              # Django admin configuration
│   ├── apps.py
│   ├── models.py             # Property, Profile, RentalApplication, Lease, MaintenanceRequest, PropertyImage, Payment
│   ├── permissions.py        # IsAdmin, IsOwnerOrAdmin, IsAdminOrLandlord
│   ├── serializers.py        # DRF ModelSerializers for all entities
│   ├── urls.py               # REST API endpoints
│   ├── views.py              # APIViews and custom dashboard endpoints
│   └── tests.py
│
├── frontend/
│   ├── public/               # Favicons and public assets
│   ├── src/
│   │   ├── components/       # Modular UI components
│   │   │   ├── AdminView.jsx            # Backend API Contract & JWT inspector
│   │   │   ├── AuthModal.jsx            # Sign in & registration modal
│   │   │   ├── CreateLeaseModal.jsx     # Landlord lease generator
│   │   │   ├── CreatePropertyModal.jsx  # Property listing form (create/edit)
│   │   │   ├── Hero.jsx                 # Search bar, filters, category chips
│   │   │   ├── LandlordDashboard.jsx    # Landlord Hub (KPIs, applications, leases, maintenance, ledger)
│   │   │   ├── MaintenanceModal.jsx     # Tenant maintenance request dispatch
│   │   │   ├── Navbar.jsx               # Header with navigation, live API status, role switcher
│   │   │   ├── PaymentModal.jsx         # Tenant rent payment processing
│   │   │   ├── PropertyCard.jsx         # Property listing card
│   │   │   ├── PropertyDetailModal.jsx  # Full details, image gallery, apply form, owner actions
│   │   │   ├── TenantPortal.jsx         # Tenant Resident Portal (applications, leases, tickets, payments)
│   │   │   └── Toast.jsx                # Toast notifications
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # AuthProvider managing JWT session & live API ping
│   │   │   └── useAuth.js               # useAuth hook
│   │   ├── services/
│   │   │   └── api.js                   # Centralized API service with JWT authorization
│   │   ├── App.jsx                      # Main coordinator component
│   │   ├── App.css
│   │   ├── index.css                    # Complete design system & responsive styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                   # Vite configuration with /api reverse proxy
│   └── .oxlintrc.json
│
├── manage.py
├── requirements.txt
├── README.md
└── .gitignore
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/`:

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Register user with role (`ADMIN`, `LANDLORD`, `TENANT`) and phone | Public |
| `POST` | `/api/login/` | Authenticate user, returns JWT `access` and `refresh` tokens | Public |
| `GET` | `/api/admin-test/` | Verification test for admin role | IsAuthenticated, IsAdmin |
| `GET` | `/api/properties/` | List properties with search, type, city, status, sort, pagination | IsAuthenticated |
| `POST` | `/api/properties/` | Create a new property listing | IsAuthenticated, IsAdminOrLandlord |
| `GET` | `/api/properties/<id>/` | Retrieve property details | IsAuthenticated, IsOwnerOrAdmin |
| `PUT` | `/api/properties/<id>/` | Update property details | IsAuthenticated, IsOwnerOrAdmin |
| `DELETE` | `/api/properties/<id>/` | Delete property | IsAuthenticated, IsOwnerOrAdmin |
| `GET` | `/api/properties/<id>/images/` | Get all images for a property | IsAuthenticated |
| `POST` | `/api/properties/<id>/images/` | Add image URL and caption to property | IsAuthenticated, Property Owner |
| `POST` | `/api/rental-application/` | Submit a rental application for a property | IsAuthenticated, Tenant |
| `GET` | `/api/rental-application/` | View rental applications submitted by tenant | IsAuthenticated, Tenant |
| `GET` | `/api/landlord/applications/` | View applications submitted for landlord's properties | IsAuthenticated, Landlord |
| `PATCH` | `/api/landlord/applications/<id>/` | Approve or reject rental application | IsAuthenticated, Landlord |
| `GET` | `/api/leases/` | View leases (Tenants see own leases; Landlords see owned leases) | IsAuthenticated |
| `POST` | `/api/leases/` | Create lease agreement from approved application | IsAuthenticated, Landlord |
| `PATCH` | `/api/leases/<id>/` | Update lease status to `ENDED` or `TERMINATED` | IsAuthenticated, Landlord |
| `GET` | `/api/maintenance-requests/` | View maintenance tickets (filtered by tenant/landlord) | IsAuthenticated |
| `POST` | `/api/maintenance-requests/` | Submit maintenance ticket for active leased property | IsAuthenticated, Tenant |
| `PATCH` | `/api/maintenance-requests/<id>/` | Landlord updates status/priority; Tenant cancels open request | IsAuthenticated |
| `GET` | `/api/payments/` | View payment records (filtered by tenant/landlord) | IsAuthenticated |
| `POST` | `/api/payments/` | Submit rent payment for active lease | IsAuthenticated, Tenant |
| `GET` | `/api/landlord/dashboard/` | Aggregated portfolio metrics | IsAuthenticated |

---

## How to Run the Project

### Prerequisites
* Python 3.10+ and `virtualenv`
* PostgreSQL installed and running with database `property_management`
* Node.js 18+ and `npm`

---

### Step 1: Start the Django Backend

1. Activate your Python virtual environment:
   ```bash
   # Windows (PowerShell)
   venv\Scripts\Activate.ps1

   # macOS / Linux
   source venv/bin/activate
   ```

2. Run database migrations:
   ```bash
   python manage.py migrate
   ```

3. Start the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

* The Django REST API will be available at: **`http://127.0.0.1:8000/api/`**
* The Django Admin interface will be available at: **`http://127.0.0.1:8000/admin/`**
* Uploaded property images are stored under `media/property_images/` and served from `/media/` during local development.

---

### Step 2: Start the React Frontend

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

* The React frontend will run on: **`http://localhost:3000/`**

---

### Port & Proxy Configuration

* **Frontend Port**: `3000`
* **Backend Port**: `8000`
* **Proxy Setup**: In `frontend/vite.config.js`, all `/api` requests are proxied directly to `http://127.0.0.1:8000`:
  ```javascript
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
  ```
  This eliminates Cross-Origin Resource Sharing (CORS) issues during local development.

---

### Frontend Production Build & Linting

* **Run Linter**:
  ```bash
  cd frontend
  npm run lint
  ```
* **Build Production Bundle**:
  ```bash
  cd frontend
  npm run build
  ```
  The production build output is generated in `frontend/dist/`.

---

## Current Project Status

### Backend (Django REST Framework + PostgreSQL)
* [x] Django project setup & PostgreSQL integration
* [x] User registration & Profile models
* [x] JWT authentication (SimpleJWT)
* [x] Role-based access control (Admin, Landlord, Tenant)
* [x] Property CRUD with search, filter, sort, and pagination
* [x] Rental applications workflow (submit, review, approve, reject)
* [x] Lease management (creation from approved applications, status updates)
* [x] Maintenance requests (tenant filing, priority levels, landlord status transitions)
* [x] Property images upload and gallery
* [x] Rent payments ledger
* [x] Landlord executive analytics dashboard API
* [x] Database migrations & Django admin configuration

### Frontend (React + Vite + JavaScript)
* [x] React + Vite project setup with custom design system
* [x] Centralized API helper with automatic JWT token attachment and error handling
* [x] Authentication modal with user registration (role selection) and login
* [x] Role switcher and dynamic role-based navigation
* [x] Property discovery catalog with search, filters, category chips, and pagination
* [x] Property detail modal with photo carousel, specifications, and owner edit/delete actions
* [x] Property creation & editing modal with image attachment
* [x] Landlord Executive Hub with real-time KPI metrics, application decisions, lease creation, ticket resolution, and payment audit
* [x] Tenant Resident Portal with application tracking, active lease viewing, maintenance ticketing, and rent payment submission
* [x] Backend API Contract Map and live Django connectivity monitor
* [x] Toast notification system for user feedback
* [x] Fully responsive layout for desktop, tablet, and mobile devices
* [x] Build and lint verification (0 errors)


## Docker Support

The application is fully containerized using **Docker and Docker Compose**. The system runs as three separate services:

```text
┌──────────────────────────────┐
│       React + Vite           │
│      Docker Container        │
│         Port 3000            │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│     Django REST Framework    │
│      Docker Container        │
│         Port 8000            │
└──────────────┬───────────────┘
               │
               │ PostgreSQL
               ▼
┌──────────────────────────────┐
│        PostgreSQL 16         │
│      Docker Container        │
│         Port 5432            │
└──────────────────────────────┘
```

### Docker Components

- **PostgreSQL**: Uses the official `postgres:16` Docker image.
- **Django Backend**: Uses a custom Docker image built from the project's root `Dockerfile`.
- **React Frontend**: Uses a custom Docker image built from `frontend/Dockerfile`.
- **Docker Compose**: Manages and connects all three containers through a shared Docker network.
- **Persistent Database Volume**: PostgreSQL uses a Docker volume named `postgres_data` for database persistence.

### Docker Project Structure

```text
property-management/
│
├── Dockerfile                 # Django backend Docker image
├── .dockerignore              # Files excluded from Docker build
├── docker-compose.yml         # Multi-container configuration
│
├── config/
├── properties/
├── manage.py
├── requirements.txt
│
└── frontend/
    ├── Dockerfile             # React frontend Docker image
    ├── package.json
    ├── vite.config.js
    └── src/
```

### Docker Configuration

The backend Docker image is based on Python 3.12 and installs the required Django and PostgreSQL dependencies.

The frontend Docker image is based on Node.js and runs the Vite development server on port `3000`.

Docker Compose connects the services using their service names:

```text
React → backend:8000 → db:5432
```

The Vite proxy forwards API and uploaded-media requests to Django. Local development defaults to `http://127.0.0.1:8000`; Docker Compose sets `VITE_BACKEND_TARGET` to `http://backend:8000`:

```javascript
proxy: {
  '/api': {
    target: 'http://backend:8000',
    changeOrigin: true,
  },
  '/media': {
    target: 'http://backend:8000',
    changeOrigin: true,
  },
},
```

Uploaded files are persisted in the Docker named volume `media_data`, separately from the database volume.

Django connects to PostgreSQL using the Docker Compose service name:

```python
"HOST": "db",
"PORT": "5432",
```

### Running the Application with Docker

From the project root:

```bash
docker compose build
```

Start all services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

The expected services are:

```text
property_management_db
property_management_backend
property_management_frontend
```

### Database Migrations

Run Django migrations inside the backend container:

```bash
docker compose exec backend python manage.py migrate
```

After migrating and starting the services, sign in as a landlord, create or open a property, choose an image file in the property form, and upload it. The frontend preview appears before upload; the saved image is served through `/media/`. Existing properties with URL-based images remain available.

Create a Django administrator:

```bash
docker compose exec backend python manage.py createsuperuser
```

### Accessing the Application

React frontend:

```text
http://localhost:3000
```

Django REST API:

```text
http://localhost:8000/api/
```

Django Administration:

```text
http://localhost:8000/admin/
```

### Stopping the Application

Stop the containers:

```bash
docker compose down
```

Start them again:

```bash
docker compose up -d
```

### Dockerization Status

- [x] Django backend Docker image
- [x] React frontend Docker image
- [x] PostgreSQL Docker container
- [x] Docker Compose configuration
- [x] Backend and database container networking
- [x] Frontend and backend container networking
- [x] Persistent PostgreSQL Docker volume
- [x] Django migrations running inside Docker
- [x] JWT authentication working through Docker
- [x] React frontend working through Docker
- [x] Full application running with Docker Compose
---

## Author

Anusha Patel

Property Management Platform — Full-Stack Django REST + React Platform
