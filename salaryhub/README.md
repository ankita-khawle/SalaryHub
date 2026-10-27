# ACME SalaryHub

A web-based employee salary management application built for ACME's HR team. SalaryHub replaces spreadsheet-based workflows with a centralized interface for managing employee records, updating salaries, reviewing salary history, and understanding compensation across departments and countries.

## Problem Statement

ACME manages salary information for approximately 10,000 employees across multiple countries using spreadsheets. SalaryHub aims to make these workflows easier, more reliable, and more accessible to HR through a web application backed by a relational database.

**Primary user:** HR Manager.

## Features

### Authentication and Security

- HR Manager sign-in using email and password.
- Protected API endpoints for employee, salary, salary history, and compensation data.
- Secure password hashing and authenticated session handling.
- Sign-out functionality.

### Employee Management

- Browse and search employee records.
- Filter employees using supported attributes, including department and employment status.
- Navigate employee records using pagination.
- View employee details and current salary information.

### Salary Management

- Update employee salary information.
- Validate salary inputs.
- Record salary history, including previous and updated salary information, effective dates, and reasons where supported.
- Review salary history from the employee profile.

### Compensation Insights

- View compensation summaries by country and department.
- Review employee counts and salary statistics.
- Group compensation by currency to avoid directly comparing amounts in different currencies.

### Seed Data

- Includes a seed script designed to populate the database with 10,000 synthetic employee records.
- The seed process checks for existing employee data to avoid unnecessarily duplicating records.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Frontend testing | Vitest, React Testing Library, `user-event` |
| Backend | Python, FastAPI |
| Backend testing | pytest, HTTPX |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database migrations | Alembic |
| API documentation | FastAPI OpenAPI/Swagger |

The frontend uses a component-based structure, with API calls separated from UI components where appropriate. Automated tests cover key frontend interactions and backend behavior.

## Project Structure

```text
.
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/routes/
│   │   │   ├── schemas/
│   │   │   └── ...
│   │   ├── alembic/
│   │   ├── scripts/
│   │   └── tests/
│   └── web/
│       └── src/
│           ├── api/
│           ├── components/
│           │   ├── DepartmentsDashboard.test.tsx
│           │   ├── EmployeeDirectory.test.tsx
│           │   ├── EmployeeProfileModal.test.tsx
│           │   └── LoginPage.test.tsx
│           └── ...
├── docs/
│   └── requirements.md
└── README.md
```

## Getting Started

### Prerequisites

- Python version compatible with the backend dependencies.
- Node.js and npm compatible with the frontend dependencies.
- PostgreSQL.

### 1. Configure the database

Create a PostgreSQL database for SalaryHub and configure the database connection using the environment variable names expected by the backend settings.

Refer to the backend configuration files for the required environment variables. Do not commit credentials or secrets.

### 2. Set up the backend

From the project root:

```bash
cd apps/api
```

Create and activate a virtual environment if needed:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies using the repository's dependency file. For example, if the project uses `requirements.txt`:

```bash
pip install -r requirements.txt
```

Configure the database connection and apply migrations:

```bash
alembic upgrade head
```

Run the seed script using the actual entry point provided by the repository. Check `app/seed.py` for its command and configuration requirements.

Start the API using the project's FastAPI application entry point. For example, if the application is exposed as `app.main:app`:

```bash
uvicorn app.main:app --reload
```

The API should be available at `http://127.0.0.1:8000` with the default Uvicorn settings.

Interactive API documentation is typically available at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

Open a second terminal from the project root:

```bash
cd apps/web
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite.

Configure the frontend API base URL according to the project's environment configuration.

## Testing and Quality Checks

Run the automated tests before submitting changes. The frontend and backend have separate test commands.

### 1. Frontend component tests

**Frameworks:** Vitest, React Testing Library, and `user-event`.

From the project root:

```bash
cd apps/web
npm test
```

This runs the frontend test suite using the `test` script configured in `apps/web/package.json`.

To run tests in watch mode during development:

```bash
npm run test:watch
```

To run only the employee directory tests:

```bash
npx vitest run src/components/EmployeeDirectory.test.tsx
```

#### Frontend test file locations and coverage

| Test file | Coverage |
|---|---|
| `apps/web/src/components/DepartmentsDashboard.test.tsx` | Dashboard rendering, loading and empty states, API errors, department data, and retry behavior |
| `apps/web/src/components/EmployeeDirectory.test.tsx` | Employee information, search, department and status filters, pagination, empty states, and interactions |
| `apps/web/src/components/EmployeeProfileModal.test.tsx` | Employee profile, salary updates, effective dates, validation, saving state, and salary history |
| `apps/web/src/components/LoginPage.test.tsx` | Login form, required fields, successful login, errors, and loading state |

These tests verify important component behavior without requiring manual interaction with every UI flow.

### 2. Backend tests

**Frameworks:** pytest and HTTPX.

From the project root, run:

```bash
apps/api/.venv/bin/python -m pytest apps/api/tests
```

This runs the backend test suite under `apps/api/tests`.

Alternatively, if the backend virtual environment is already activated:

```bash
cd apps/api
python -m pytest tests
```

The backend tests cover the implemented API endpoints and business logic, including the behavior exercised by the existing test suite.

### 3. Frontend production build

From the project root:

```bash
cd apps/web
npm run build
```

This verifies the frontend production build, including TypeScript and Vite build checks configured by the project.

### 4. Frontend lint

From `apps/web`:

```bash
npm run lint
```

This runs the configured frontend lint checks.

### Recommended pre-submission checklist

- [ ] All React component tests pass.
- [ ] All Python backend tests pass.
- [ ] Frontend production build succeeds.
- [ ] Frontend lint passes.
- [ ] Database migrations apply successfully.
- [ ] Seed data can be loaded into a clean database.
- [ ] The README setup commands match the repository configuration.

## Requirements and Design Decisions

Key decisions include:

- **Authentication:** Protect sensitive HR data and restrict initial access to the HR Manager.
- **Relational data model:** Maintain relationships between employees, departments, and salary history.
- **Server-side pagination and filtering:** Avoid loading the full employee dataset into the browser.
- **Salary history:** Maintain an audit trail of compensation changes.
- **Currency-aware analytics:** Avoid misleading comparisons between different currencies.
- **Focused scope:** Prioritize employee and salary management over payroll processing, tax calculations, recruitment, and complex enterprise identity features.

## AI-Assisted Development

AI tools were used to support implementation and problem-solving. Generated suggestions and code were reviewed and validated through development checks and automated tests. Engineering decisions and final responsibility for correctness remain with the developer.

## Assessment Scope

This project is designed around the ACME employee salary management assessment. The initial scope focuses on employee records, salary management, salary history, and compensation insights for an organization with approximately 10,000 employees.

## Deployment and Demo

- **Live application:** To be added after deployment and verification.
- **Demo video:** To be added after recording.
- **Repository:** This repository contains the application source code and supporting requirements documentation.

## Limitations

SalaryHub is an assessment project, not a complete payroll or enterprise HR platform. Payroll execution, tax calculations, enterprise SSO, and complex role hierarchies are outside the initial scope.

Before production use, the application would require a security review, deployment hardening, operational monitoring, backup and recovery procedures, and verification of authentication, authorization, and session-management controls.
