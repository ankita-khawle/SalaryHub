
# SalaryHub — Architecture and Design

## 1. Overview

SalaryHub is an employee salary management application for ACME's HR Manager. It supports employee discovery, salary updates, salary-history review, and compensation summaries across departments and countries.

The application uses a React frontend, a FastAPI backend, and PostgreSQL for persistent relational data.

## 2. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React, TypeScript, Vite | HR interface and user interactions |
| UI components | React components, CSS, Lucide icons | Employee directory, profile, and dashboards |
| API client | Axios | HTTP requests to the backend |
| Backend | Python, FastAPI | API endpoints, validation, and business logic |
| Authentication | PyJWT, pwdlib | Signed session tokens and password verification |
| ORM | SQLAlchemy | Database access and relational models |
| Database | PostgreSQL | Persistent employee, department, and salary-history data |
| Migrations | Alembic | Versioned database schema changes |
| Testing | pytest, HTTPX | Backend behavior and API tests |

## 3. High-Level Architecture

```text
HR Manager
    |
    v
React + TypeScript Frontend
    |
    | Axios requests with session cookie
    v
FastAPI Backend
    |
    +--> Authentication
    |       |
    |       +--> Verify configured HR Manager credentials
    |       +--> Issue and validate signed session tokens
    |
    +--> Employee API
    |       +--> Search, filter, paginate
    |       +--> Employee details
    |       +--> Salary updates
    |
    +--> Department API
    |
    +--> Compensation API
    |
    v
SQLAlchemy
    |
    v
PostgreSQL
```

## 4. Frontend Structure

The frontend separates API requests from the main interface.

- `src/api/client.ts`: Shared Axios client and API configuration.
- `src/api/auth.ts`: Login, current-session lookup, and logout requests.
- `src/api/employees.ts`: Employee, department, salary-update, and compensation requests.
- `src/components/LoginPage.tsx`: HR Manager sign-in screen.
- `src/components/EmployeeDirectory.tsx`: Employee browsing and filtering.
- `src/components/EmployeeProfileModal.tsx`: Employee details and salary management.
- `src/components/DepartmentsDashboard.tsx`: Department overview.
- `src/components/CompensationDashboard.tsx`: Compensation summaries.
- `src/App.tsx`: Application state, navigation, session handling, and dashboard composition.

The frontend checks the current session before displaying the protected dashboard.

## 5. Backend Structure

The backend is organized around FastAPI routes, application configuration, database access, models, and schemas.

- `app/main.py`: FastAPI application setup, router registration, and middleware.
- `app/api/routes/`: API endpoints, including authentication and HR workflows.
- `app/core/config.py`: Environment-based application configuration.
- `app/core/security.py`: Session-token creation and authentication checks.
- `app/db/`: Database session and connection setup.
- `app/models/`: SQLAlchemy models.
- `app/schemas/`: Request and response validation.
- `app/seed.py`: Synthetic employee and salary-history data generation.
- `alembic/`: Database migration environment and versioned migrations.
- `tests/`: Backend automated tests.

## 6. Data Model

### Department

Represents an organizational department and is referenced by employees.

### Employee

Stores employee information, including employee code, name, email, job title, department, hire date, salary, country, currency, and employment status.

### SalaryHistory

Records salary events associated with an employee, including the previous salary, new salary, and effective date.

The relational structure supports employee-to-department relationships and employee-to-salary-history relationships.

Salary changes should update the employee's current salary and create the corresponding history record consistently within a database transaction.

## 7. Authentication and Security

- The HR Manager signs in using a configured email and a password hash stored in environment configuration.
- Password verification uses a password-hashing library rather than storing a plaintext password.
- Successful login issues a signed JWT in an HttpOnly cookie.
- Protected HR endpoints require a valid authenticated session.
- Logout clears the browser's session cookie.
- The frontend sends cookies with API requests.
- Secrets and local environment files must not be committed to version control.

The current implementation supports one HR Manager account. It does not implement enterprise SSO or a multi-role permission system.

Before production deployment, authentication, cookie settings, cross-origin behavior, CSRF protection, and session invalidation should receive further security review.

## 8. API Responsibilities

The API exposes health checks and HR workflows.

| Endpoint group | Responsibility |
|---|---|
| `/api/health` | Application health |
| `/api/health/db` | Database connectivity |
| `/api/auth/*` | Login, current session, and logout |
| `/api/employees` | Employee listing and details |
| `/api/employees/{employee_id}/salary` | Salary updates |
| `/api/departments` | Department data |
| `/api/compensation/summary` | Compensation summaries |

Employee listing uses server-side filtering and pagination so the browser does not need to load the full employee dataset.

## 9. Data Initialization and Migrations

Alembic manages schema changes. The seed script generates deterministic synthetic data using a fixed random seed.

The seed script is designed to create:

- 10,000 employees
- 10 departments
- Initial salary-history records

Employee insertion is batched to keep database operations manageable. The script checks for existing employee data before seeding to avoid duplicate initialization.

The current development database has been verified to contain 10,000 employees and 10 departments. All employees have at least one salary-history record.

## 10. Testing Strategy

Backend tests cover authentication-related behavior and core API/business logic.

Validation includes:

- Authentication and protected endpoint access.
- Employee listing and details.
- Salary updates and history.
- Department and compensation responses.
- Health and database behavior.

The frontend production build checks TypeScript compilation and bundles the application.

## 11. Design Trade-offs

- **Relational storage:** Provides relationships and constraints for employee, department, and salary-history data.
- **Server-side pagination:** Avoids loading thousands of employee records into the frontend.
- **Salary-history records:** Preserve a traceable history of compensation changes.
- **Currency-aware summaries:** Prevent direct comparisons of amounts denominated in different currencies.
- **Simple authentication:** Meets the initial single-HR-user scope without introducing a full identity platform.
- **Focused application scope:** Excludes payroll execution, tax calculations, recruitment, and advanced enterprise workflows.

## 12. Future Production Hardening

Potential follow-up work includes deployment automation, stricter security configuration, CSRF defenses, structured logging, monitoring, database backup and recovery, and additional frontend integration tests.
