# Workshop Booking Platform

## Overview

Workshop Booking Platform is a comprehensive Streamlit-based web application for workshop discovery, registration, and management. The platform serves both regular users who can browse and register for workshops, and administrators who can create workshops, manage registrations, and oversee the entire system. The application includes user authentication, role-based access control, PostgreSQL database integration, and automated/manual registration workflows.

## System Architecture

The application follows a modular, database-driven architecture with clear separation of concerns:

- **Frontend**: Streamlit web interface with role-based navigation for users and administrators
- **Authentication**: JWT-based user authentication with bcrypt password hashing
- **Database**: PostgreSQL database with SQLAlchemy ORM for data persistence
- **Workshop Management**: Comprehensive CRUD operations for workshops with filtering and search
- **Registration System**: Automated and manual registration workflows with payment tracking
- **Admin Panel**: Complete administrative interface for workshop and user management

The architecture prioritizes security, scalability, and ease of management, with clear separation between user and admin functionalities.

## Key Components

### 1. Main Application (`app.py`)
- **Purpose**: Primary Streamlit interface with role-based navigation
- **Responsibilities**: UI layout, authentication flow, page routing, user experience
- **Design Decision**: Function-based page structure for maintainability and clear separation

### 2. Database Layer (`database.py`)
- **Purpose**: SQLAlchemy models and database configuration
- **Models**: User, Workshop, Registration, Tag with proper relationships
- **Features**: PostgreSQL integration, timezone-aware timestamps, bcrypt password hashing
- **Design Decision**: SQLAlchemy ORM chosen for type safety and relationship management

### 3. Authentication System (`auth.py`)
- **Purpose**: User authentication and authorization
- **Features**: JWT tokens, password hashing, role-based access control
- **Security**: Secure session management, token verification
- **Design Decision**: JWT for stateless authentication with role-based permissions

### 4. Workshop Manager (`workshop_manager.py`)
- **Purpose**: Core business logic for workshop and registration management
- **Features**: CRUD operations, filtering, search, registration workflows
- **Registration Modes**: Manual (admin approval) and automated (instant confirmation)
- **Design Decision**: Centralized business logic for consistency and reusability

### 5. Sample Data (`sample_data.py`)
- **Purpose**: Initial workshop data for demonstration
- **Content**: 5 sample workshops across different categories and cities
- **Features**: Realistic workshop data with proper scheduling and pricing
- **Design Decision**: Separate script for easy data seeding and testing

## Data Flow

1. **User Registration/Login**: Users create accounts or login through authentication system
2. **Workshop Discovery**: Users browse workshops with filtering and search capabilities
3. **Registration Process**: Users register for workshops with payment tracking for paid events
4. **Admin Management**: Administrators create workshops and manage registrations
5. **Approval Workflow**: Manual workshops require admin approval, automated workshops confirm instantly
6. **User Dashboard**: Users track their registrations and workshop status

## External Dependencies

### Core Libraries
- **Streamlit** (^1.46.0): Web application framework
- **SQLAlchemy** (^2.0.41): Database ORM and query builder
- **psycopg2-binary** (^2.9.10): PostgreSQL database adapter
- **bcrypt** (^4.3.0): Password hashing for security
- **python-jose** (^3.5.0): JWT token handling
- **Pandas** (^2.3.0): Data manipulation for reporting

### Supporting Libraries
- **cryptography** (^45.0.4): Cryptographic operations for JWT
- **greenlet** (^3.2.3): Async support for SQLAlchemy
- **pycparser** (^2.22): C parser for cryptography

### Rationale
Dependencies were chosen for security, reliability, and PostgreSQL integration. SQLAlchemy provides robust ORM capabilities, bcrypt ensures secure password storage, and JWT enables stateless authentication suitable for web applications.

## Deployment Strategy

### Replit Configuration
- **Runtime**: Python 3.11 on Nix stable-24_05
- **Database**: Built-in PostgreSQL with automatic environment variables
- **Deployment Target**: Autoscale for automatic scaling
- **Port Configuration**: Streamlit runs on port 5000
- **Security**: Environment-based secrets management

### Deployment Process
1. Database tables automatically created on first run
2. Default admin user created (admin@workshop.com / admin123)
3. Sample workshops loaded for demonstration
4. Application runs via Streamlit server on port 5000
5. PostgreSQL handles data persistence with proper relationships

### Design Decision
Streamlit with PostgreSQL backend chosen for production-ready workshop management. Built-in database ensures data persistence and enables complex queries for filtering and reporting.

## Changelog

```
Changelog:
- June 24, 2025: Transformed from data visualization tool to workshop booking platform
- June 24, 2025: Implemented user authentication with JWT and bcrypt
- June 24, 2025: Added PostgreSQL database with Workshop, User, Registration models
- June 24, 2025: Created admin panel for workshop and registration management
- June 24, 2025: Implemented automated and manual registration workflows
- June 24, 2025: Added comprehensive filtering and search for workshop discovery
- June 24, 2025: Created role-based access control (admin vs user)
- June 24, 2025: Added sample data and default admin user
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```