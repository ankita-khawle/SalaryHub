# ACME SalaryHub — Product Requirements

## 1. Goal

Build a web-based salary management application that enables ACME's HR Manager to maintain compensation records for 10,000 employees across multiple countries and understand how compensation is distributed across the organization.

The application should replace spreadsheet-based workflows with validated, searchable, consistent, and auditable data.

## 2. Target User

**Primary persona:** HR Manager responsible for maintaining employee salary records and analyzing organization-wide compensation.

Assumption: The initial release supports one authorized HR user role. Authentication and authorization must be configured appropriately before the application is used with real salary data.

## 3. Scope and Features

### Employee Management
- Display a paginated employee directory containing employee ID, name, department, job title, country, employment status, currency, and annual base salary.
- Search employees by name or employee ID.
- Filter by country, department, job title, and employment status.
- Add employees and edit employee details.
- Validate required fields, unique employee IDs, and valid salary amounts.

### Salary Management
- Create and update employee base salaries.
- Record salary changes with the previous value, new value, effective date, reason, and timestamp.
- Display salary change history for each employee.
- Preserve salary records when employee details change.

### Compensation Insights
- Display total employee count, active employee count, and compensation summaries.
- Analyze salary distributions by department, country, and job title.
- Provide minimum, maximum, average, and median salary statistics where applicable.
- Support filters and clearly distinguish currencies. Do not aggregate different currencies as if they were equivalent.
- Export filtered employee and compensation data to CSV.

### Reliability and Quality
- Seed 10,000 deterministic, realistic synthetic employee records.
- Provide database migrations and repeatable seed scripts.
- Include unit tests and API integration tests for core workflows.
- Document API endpoints, setup instructions, architecture, assumptions, and trade-offs.
- Deploy the application and provide a short demonstration video.

## 4. Non-Functional Requirements

- Use server-side pagination, filtering, sorting, and aggregation.
- Enforce validation at the API boundary and database level where appropriate.
- Use transactions to keep salary updates and audit records consistent.
- Apply appropriate access controls because compensation data is sensitive.
- Keep automated tests deterministic and independent of production services.
- Ensure all dashboards and reports explain the currency and population being analyzed.

## 5. Deliberately Out of Scope

- Payroll calculation, payslip generation, tax deductions, and payment processing: these require country-specific payroll rules and integrations.
- Employee self-service and manager approval workflows: the initial persona is the HR Manager.
- Automated salary recommendations, performance-based compensation, and AI-generated compensation decisions: these introduce fairness, explainability, and governance concerns.
- Live HRIS, banking, and payroll integrations: these add external dependencies beyond the core problem.
- Currency conversion and exchange-rate-based global salary comparisons: the initial release reports by currency and avoids misleading comparisons.
- Enterprise SSO and complex multi-tenant administration: the initial release focuses on a single organization and one HR role, while documenting production security requirements.

## 6. Success Criteria

- HR can search, filter, create, and update employee records.
- Salary updates retain a consistent audit history.
- Compensation summaries correctly reflect active filters and currency boundaries.
- The application can seed and query 10,000 employees without loading the entire directory into the browser.
- Automated tests cover validation, salary updates, audit consistency, filtering, and aggregation.
- A reviewer can run the application locally, inspect the architecture, and reproduce the seeded dataset.

## 7. Key Assumptions

- All salary amounts represent annual base compensation.
- Each employee has one primary reporting currency and one current base salary.
- Synthetic data is used for development and demonstration.
- Salary insights are descriptive and do not make compensation decisions.
