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
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database migrations | Alembic |
| Backend tests | pytest, HTTPX |
| API documentation | FastAPI OpenAPI/Swagger |

The frontend uses a component-based structure, with API calls separated from UI components where appropriate.

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

Activate the existing virtual environment or create one if needed:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies using the repository's dependency file. For example, if the project uses `requirements.txt`:

```bash
pip install -r requirements.txt
```

Configure the database connection, then apply migrations using the migration configuration in the project:

```bash
alembic upgrade head
```

Run the seed script using the actual module or command provided by the repository. Check `app/seed.py` for its entry point and required configuration.

Start the API using the project's FastAPI application entry point. For example, if it is exposed as `app.main:app`:

```bash
uvicorn app.main:app --reload
```

The API should be available at `http://127.0.0.1:8000` if using the default Uvicorn settings.

FastAPI's interactive API documentation is typically available at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd apps/web
npm install
npm run dev
```

Open the local URL printed by Vite.

Configure the frontend API base URL according to the project's environment configuration.

## Testing and Quality Checks

### Backend tests

From the project root:

```bash
apps/api/.venv/bin/python -m pytest apps/api/tests
```

### Frontend production build

```bash
cd apps/web
npm run build
```

### Frontend lint

```bash
npm run lint
```

The production build checks TypeScript compilation and generates the frontend build. Backend tests cover the implemented API and business logic. Run all checks before submitting changes.

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

This project is designed around the ACME employee salary management assessment. The initial scope focuses on employee records, salary management, salary history, and compensation insights for an organization with 10,000 employees.

## Deployment and Demo

- **Live application:** To be added after deployment and verification.
- **Demo video:** To be added after recording.
- **Repository:** This repository contains the application source code and supporting requirements documentation.

## Limitations

SalaryHub is an assessment project, not a complete payroll or enterprise HR platform. Payroll execution, tax calculations, enterprise SSO, and complex role hierarchies are outside the initial scope.

Before production use, the application would require a security review, deployment hardening, operational monitoring, backup and recovery procedures, and verification of authentication, authorization, and session-management controls.