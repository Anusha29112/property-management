# Property Management Platform

A full-stack property management platform built for managing properties, landlords, tenants, rental applications, leases, maintenance requests, property images, and payments.

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication
* Git & GitHub


> The current implementation focuses on the Django REST API backend. The React frontend will be developed separately.

---

## Project Features

### Authentication & Authorization

* User registration
* User login
* JWT authentication
* Role-based access
* Admin
* Landlord
* Tenant
* Protected API endpoints

### Property Management

Landlords can:

* Create properties
* View their properties
* Update properties
* Delete properties
* Manage property status
* Manage property type
* Add property images

Tenants can:

* View available properties
* Search properties
* Filter properties
* Sort properties
* Use pagination

### Rental Applications

Tenants can:

* Submit rental applications
* View their applications

Landlords can:

* View applications for their properties
* Approve applications
* Reject applications

The system prevents duplicate applications and prevents changes after an application reaches a final status.

### Lease Management

The platform supports:

* Creating leases from approved rental applications
* Connecting leases with properties
* Connecting leases with tenants
* Connecting leases with landlords
* Viewing active leases
* Ending leases
* Terminating leases

Only approved rental applications can be converted into leases.

### Maintenance Requests

Tenants can:

* Create maintenance requests
* View their maintenance requests
* Cancel open requests

Landlords can:

* View maintenance requests for their properties
* Change request priority
* Change request status

Supported statuses:

* OPEN
* IN_PROGRESS
* COMPLETED
* CANCELLED

Supported priorities:

* LOW
* MEDIUM
* HIGH
* URGENT

### Property Images

Landlords can add images to their properties.

Each image contains:

* Image URL
* Caption
* Property relationship
* Creation timestamp

### Payments

Tenants can:

* Create payment records for their active leases
* View their payments

Landlords can:

* View payments associated with their leases

Supported payment methods:

* CASH
* BANK_TRANSFER
* CREDIT_CARD
* DEBIT_CARD

Supported payment statuses:

* PENDING
* COMPLETED
* FAILED

---



## User Roles

### Admin

The Django admin can be used to manage:

* Users
* Profiles
* Properties
* Rental applications
* Leases
* Maintenance requests
* Property images
* Payments

### Landlord

A landlord can:

* Manage their own properties
* Add property images
* View rental applications for their properties
* Approve or reject applications
* Create leases from approved applications
* View and manage their leases
* View maintenance requests
* Update maintenance request status and priority
* View payments related to their leases

### Tenant

A tenant can:

* Browse properties
* Search and filter properties
* Submit rental applications
* View their applications
* View their leases
* Submit maintenance requests
* Cancel open maintenance requests
* Submit payments
* View their payments

---

## Database Relationships

Main entities:

```text
User
 │
 ├── Profile
 │
 ├── Properties (Landlord)
 │
 ├── Rental Applications (Tenant)
 │
 ├── Leases (Tenant)
 │
 ├── Maintenance Requests (Tenant)
 │
 └── Payments (Tenant)


Property
 │
 ├── Rental Applications
 ├── Leases
 ├── Maintenance Requests
 └── Property Images


RentalApplication
 │
 └── Lease


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
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── properties/
│   ├── migrations/
│   ├── admin.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   └── tests.py
│
├── manage.py
├── README.md
└── .gitignore
```


## Authentication

The API uses JWT authentication.

After logging in, use the returned access token in the request header:

```text
Authorization: Bearer <access_token>
```

Protected endpoints require authentication.

---

## Current Project Status

### Backend

* [x] Django project setup
* [x] PostgreSQL integration
* [x] User registration
* [x] JWT authentication
* [x] Role-based authorization
* [x] Property CRUD
* [x] Property search
* [x] Property filtering
* [x] Property sorting
* [x] Pagination
* [x] Rental applications
* [x] Lease management
* [x] Maintenance requests
* [x] Property images
* [x] Payments
* [x] Django admin configuration
* [x] Database migrations
* [x] API testing



## Author

Anusha Patel

Property Management Platform — Django REST API + PostgreSQL
