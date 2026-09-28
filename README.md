# Property Management Platform

A full-stack property management application built for learning and practicing modern backend development.

The backend is being developed using **Django, Django REST Framework, PostgreSQL, JWT Authentication, and custom authorization/permissions**.

---

## Project Status

### Completed Features

* Django project setup
* PostgreSQL database integration
* Property model
* Database migrations
* Django REST Framework
* Property CRUD APIs
* User registration
* User login
* JWT authentication
* Authentication using access tokens
* Role-based authorization
* Custom permissions using `BasePermission`
* Admin, Landlord, and Tenant roles
* Property ownership
* Object-level permissions
* Owner/Admin property access control
* Git and GitHub integration

---

## Technologies

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* PostgreSQL

### Development Tools

* VS Code
* Postman
* pgAdmin 4
* Git
* GitHub

---

## Application Roles

The application currently supports three roles:

### Admin

Admin has system-level privileges.

* Access admin functionality
* View properties
* Create properties
* Manage properties
* Access properties owned by other users

### Landlord

Landlords manage their own properties.

* Login
* View properties
* Create properties
* View their own properties
* Update their own properties
* Delete their own properties
* Cannot modify another landlord's property

### Tenant

Tenants can currently:

* Register
* Login
* View properties
* Access authenticated APIs

Tenants cannot currently create, update, or delete properties.


---

## Authentication

The application uses **JWT (JSON Web Token)** authentication.

### Login Flow

```text
User
  ↓
POST /api/login/
  ↓
Username + Password
  ↓
Django Authentication
  ↓
JWT Access Token
  ↓
Send Token with API Requests
```

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

---


### Current Permission Structure

```text
IsAuthenticated
        ↓
User must be logged in


IsAdmin
        ↓
Only ADMIN users


IsAdminOrLandlord
        ↓
ADMIN or LANDLORD


IsOwnerOrAdmin
        ↓
Property owner OR ADMIN
```

---

## Property Ownership

Each property has an owner.

```text
User
  │
  │ 1
  │
  └──────────< Properties
                  │
                  └── owner
```

When a landlord creates a property:

```python
serializer.save(owner=request.user)
```

The property is automatically connected to the logged-in user.

This prevents users from manually choosing another user as the owner.

---

## Object-Level Authorization

The project uses:

```python
self.check_object_permissions(request, property)
```

This checks whether the current user is allowed to access a specific property.



---

## Current API Endpoints

### Authentication

#### Register

```text
POST /api/register/
```

#### Login

```text
POST /api/login/
```

---

### Properties

#### Get all properties

```text
GET /api/properties/
```

#### Create property

```text
POST /api/properties/
```

#### Get specific property

```text
GET /api/properties/<id>/
```

#### Update property

```text
PUT /api/properties/<id>/
```

#### Delete property

```text
DELETE /api/properties/<id>/
```

---

### Admin

#### Admin test endpoint

```text
GET /api/admin-test/
```

Only users with the Admin role can access this endpoint.

---

## Project Structure

```text
property-management/
│
├── config/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── properties/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
│
├── manage.py
├── .gitignore
└── README.md
└── requirement.txt
```

---

## Database Structure

### User

Django's built-in User model stores:

```text
id
username
password
email
first_name
last_name
```

### Profile

```text
id
user
role
phone
```

Profile has a one-to-one relationship with User.

```text
User 1 ───────── 1 Profile
```

### Property

```text
id
owner
title
description
address
city
province
postal_code
rent
bedrooms
bathrooms
property_type
status
created_at
updated_at
```

Relationship:

```text
User 1 ───────── * Property
```

One user can own multiple properties.

---

## Database

PostgreSQL is used as the main database.

```text
Django
   ↓
Django ORM
   ↓
PostgreSQL
```

Database:

```text
property_management
```


## Learning Goals

This project is being developed to gain practical experience with:

* Python
* Django
* Django REST Framework
* REST APIs
* PostgreSQL
* Authentication
* Authorization
* JWT
* Object-level permissions
* Database relationships
* CRUD operations
* Git and GitHub
* React
* Full-stack application development

---

## Author

Anusha Patel
