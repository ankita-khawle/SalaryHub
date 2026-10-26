# ACME SalaryHub

**Employee Salary Management & Compensation Analytics**

ACME SalaryHub is a web-based employee compensation management application designed to help HR managers manage employee salary data across multiple countries.

The application replaces spreadsheet-based workflows with a centralized platform for employee management, salary updates, compensation analytics, and auditable salary history.

The system is designed for an organization with approximately **10,000 employees**, emphasizing data integrity, maintainability, security, and efficient data access.

## Features

### Employee Management
- Search employees by name or employee ID.
- Filter employees by country, department, job title, and employment status.
- View employee details and current annual base salary.
- Create and update employee records.
- Support server-side pagination and sorting.

### Salary Management
- Create and update employee salary records.
- Validate salary amounts and currency codes.
- Maintain salary change history, including previous and new amounts, effective dates, and reasons.
- Keep salary updates and history records transactionally consistent.

### Compensation Analytics
- View employee and active employee counts.
- Analyze compensation by department and country.
- Calculate minimum, maximum, average, and median salaries.
- Display salary statistics separately by currency to avoid misleading comparisons.
- Export filtered employee and salary data to CSV.

### Data Quality
- Seed the database with 10,000 synthetic employee records.
- Use version-controlled database migrations.
- Validate API requests and enforce database constraints.
- Include automated tests for core business workflows.
- Provide API documentation and deployment instructions.

> **Implementation status:** These features describe the intended scope. Update the README as features are implemented and verified.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI Components | Material UI (MUI) |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Request Validation | Pydantic |
| Database Migrations | Alembic |
| Backend Testing | pytest, HTTPX |
| Frontend Testing | Vitest, React Testing Library |
| Charts | Recharts |
| API Documentation | OpenAPI / Swagger UI |
| Deployment | Vercel and a managed API/database host |

## Architecture

The application follows a **modular monolith architecture**, with a Python REST API, a React frontend, and a relational database.

```mermaid
flowchart TD
    HR[HR Manager] --> UI[React + TypeScript]
    UI --> API[FastAPI REST API]
    API --> VALID[Pydantic Validation]
    VALID --> EMP[Employee Service]
    VALID --> SAL[Salary Service]
    VALID --> ANA[Analytics Service]
    EMP --> ORM[SQLAlchemy]
    SAL --> ORM
    ANA --> ORM
    ORM --> DB[(PostgreSQL)]
    SAL --> HIST[Salary History]
```

### Key Engineering Decisions

- **FastAPI:** Provides typed request and response contracts, input validation, and automatic API documentation.
- **SQLAlchemy:** Provides explicit control over database queries and transactions.
- **PostgreSQL:** Supports relational integrity, indexing, transactional updates, and database-side aggregation.
- **Modular monolith:** Keeps deployment and operations simple without introducing unnecessary microservices.
- **Server-side pagination:** Avoids loading all employee records into the browser.
- **Currency-aware analytics:** Prevents incorrect aggregation of salaries denominated in different currencies.
- **Deterministic seed data:** Makes testing and demonstrations reproducible.

See [`docs/architecture.md`](docs/architecture.md) for detailed architecture and trade-offs.

## Project Structure

```text
salaryhub/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── routes/
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── db/
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   └── .env.example
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── features/
│       │   │   ├── employees/
│       │   │   ├── salaries/
│       │   │   └── analytics/
│       │   ├── api/
│       │   └── pages/
│       ├── package.json
│       └── .env.example
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── ai-usage.md
├── .gitignore
└── README.md
```

The structure may evolve as the implementation progresses.

## Prerequisites

Install the following:

- Python 3.12 or later
- Node.js LTS and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd salaryhub
```

### 2. Configure the Backend

Navigate to the API directory:

```bash
cd apps/api
```

Create and activate a virtual environment.

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows PowerShell**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
pip install -e ".[dev]"
```

This assumes the project's `pyproject.toml` defines the application package and development dependencies.

### 3. Configure Environment Variables

Create an `.env` file based on the API's `.env.example`.

Example:

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/salaryhub
APP_ENV=development
CORS_ORIGINS=http://localhost:5173
```

Use local development credentials and never commit secrets to version control.

### 4. Run Database Migrations

From `apps/api`:

```bash
alembic upgrade head
```

This applies the version-controlled schema migrations to the configured database.

### 5. Seed the Database

Run the documented seed command once it is implemented. For example:

```bash
python -m app.db.seed
```

The seed script should generate 10,000 synthetic employees with valid employee identifiers and associated salary records.

The seed process should be deterministic and repeatable, without creating duplicate records on subsequent runs.

### 6. Start the Backend

From `apps/api`:

```bash
uvicorn app.main:app --reload --port 8000
```

Once configured, the local API should be available at:

- API base URL: `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc`

### 7. Start the Frontend

Open a separate terminal:

```bash
cd apps/web
npm install
```

Create the frontend `.env` file based on `.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Start the React development server:

```bash
npm run dev
```

The frontend should be available at `http://localhost:5173`.

*The setup commands above assume the corresponding package scripts, seed module, and configuration are present in the completed implementation.*

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Application health check |
| GET | `/api/employees` | List and filter employees |
| POST | `/api/employees` | Create an employee |
| GET | `/api/employees/{id}` | Retrieve employee details |
| PATCH | `/api/employees/{id}` | Update employee information |
| PATCH | `/api/employees/{id}/salary` | Update current salary |
| GET | `/api/employees/{id}/salary-history` | Retrieve salary history |
| GET | `/api/analytics/summary` | Compensation summary |
| GET | `/api/analytics/by-department` | Department-level analytics |
| GET | `/api/analytics/by-country` | Country-level analytics |
| GET | `/api/employees/export` | Export filtered employee data |

These endpoints describe the planned API contract. The final endpoint paths and request schemas should match the implemented FastAPI routes.

## Testing

The testing strategy focuses on business correctness, data integrity, and maintainability.

### Backend

The backend test suite should cover:

- Employee creation and duplicate identifier validation.
- Search, filtering, sorting, and pagination.
- Salary validation and salary history.
- Transaction rollback when an update fails.
- Currency-aware compensation calculations.
- Median calculations for odd and even populations.
- CSV export and filter correctness.
- Seed data uniqueness and repeatability.

Run backend tests from `apps/api`:

```bash
pytest
```

### Frontend

Frontend tests should cover:

- Employee search and filters.
- Form validation.
- Salary editing workflows.
- Loading, empty, and error states.
- Correct rendering of analytics.

Run frontend tests from `apps/web`:

```bash
npm test
```

Use the actual scripts configured in `package.json`. Test results should be verified before marking the project complete.

## Security Considerations

Salary information is sensitive employee data. Before real-world use, the application must include:

- Authentication and appropriate authorization.
- Server-side validation of all requests.
- Access controls for salary updates and exports.
- Secure secret management.
- Restricted logging of sensitive employee information.
- HTTPS in deployed environments.
- Synthetic data for development and demonstration.

An operational deployment should not be considered production-secure until its access controls and security configuration have been implemented and verified.

## AI-Assisted Development

AI tools are used to support requirements analysis, architecture reviews, implementation, and code review.

AI-generated code is reviewed and validated rather than accepted without verification. Automated tests, type checks, and manual inspection are used to verify important behaviors.

The AI development log records significant prompts, corrections, verification steps, and engineering decisions.

See [`docs/ai-usage.md`](docs/ai-usage.md).

## Trade-offs and Future Improvements

The initial scope prioritizes employee management, salary updates, auditability, and compensation reporting.

Potential future enhancements include:

- Enterprise SSO and more granular permissions.
- Salary approval workflows.
- Bulk employee imports.
- HRIS integrations.
- Exchange-rate-aware global compensation comparisons.
- Advanced audit retention and monitoring.

These features are intentionally excluded from the initial release unless required by the assessment.

## Deployment

- **Live application:** To be added.
- **API documentation:** To be added.
- **Demo video:** To be added.

Deployment instructions, environment configuration, and database migration procedures should be updated after the hosting environment has been configured and verified.

## Assessment Artifacts

- [Product Requirements](docs/requirements.md)
- [Architecture and Design Decisions](docs/architecture.md)
- [AI-Assisted Development Log](docs/ai-usage.md)

The Git history captures the incremental development process and important implementation decisions.

## License

Created as a software engineering assessment and demonstration project.
