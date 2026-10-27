# ACME SalaryHub — Requirements

## 1. Goal

Build a web-based salary management application that helps ACME's HR Manager manage employee and salary information for 10,000 employees across multiple countries, replacing spreadsheet-based workflows with a centralized, searchable, and reliable system.

## 2. Primary User

**HR Manager:** Needs to access employee records, maintain salary information, review salary history, and understand compensation across the organization.

## 3. Scope and Features

### Authentication and Access Control
- Allow the HR Manager to sign in using email and password.
- Protect employee, salary, salary history, and compensation endpoints against unauthenticated access.
- Restrict the initial application to the HR Manager role.
- Store passwords using a secure password-hashing algorithm and manage authentication credentials securely.
- Provide a way to sign out and end the authenticated session.

### Employee Management
- Browse, search, filter, sort, and paginate employee records.
- Filter employees by supported attributes such as department, country, and employment status.
- View employee details, including current salary information.

### Salary Management
- Update employee salary information with an effective date and reason.
- Validate salary amounts and currency codes.
- Maintain salary history, including previous and updated amounts, effective dates, and reasons.
- Keep salary updates and their corresponding history records consistent.

### Compensation Insights
- View employee and active-employee counts.
- Summarize compensation by country and department.
- Display minimum, maximum, and average salary statistics.
- Group compensation by currency to avoid misleading comparisons between currencies.

### Data and Quality
- Provide a repeatable seed process for 10,000 synthetic employees.
- Use a relational database with schema migrations and appropriate constraints.
- Include automated tests for authentication, access control, and core business logic.
- Provide local setup instructions and API documentation.

## 4. Non-Functional Requirements

- **Security:** Protect sensitive salary data, hash passwords securely, validate inputs, and avoid exposing credentials or secrets.
- **Usability:** Provide a clear, responsive interface for routine HR workflows.
- **Performance:** Use server-side filtering and pagination to avoid loading all employee records into the browser.
- **Data integrity:** Maintain transactional consistency for salary updates and history.
- **Maintainability:** Keep the frontend, backend, data models, and tests organized into understandable modules.
- **Testability:** Keep tests fast, deterministic, and easy to understand.

## 5. Deliberately Out of Scope

- **Payroll processing and payments:** The application manages salary records but does not execute payroll.
- **Tax, benefits, and statutory compliance:** These require separate country-specific business rules.
- **Recruitment and performance management:** These are unrelated to the initial salary-management problem.
- **Enterprise SSO and social login:** A simple email-and-password login is sufficient for the initial assessment.
- **Complex role hierarchies:** The initial version supports one HR Manager role rather than a configurable permissions system.
- **Advanced analytics and real-time collaboration:** Basic compensation summaries address the initial need.
- **AI-powered product features:** AI tools support development, but the assessment does not require AI functionality inside the application.

## 6. Key Trade-offs

- A relational database supports consistent relationships between employees, departments, and salary history.
- Server-side filtering and pagination support the 10,000-employee dataset.
- Salary history provides an audit trail for compensation changes.
- Compensation statistics are grouped by currency because values in different currencies are not directly comparable.
- Authentication protects sensitive data without introducing the complexity of enterprise identity management.
- The initial implementation prioritizes essential HR workflows, security, and maintainability over distributed architecture and additional enterprise features.

## 7. Acceptance Criteria

- The HR Manager can authenticate and sign out.
- Unauthenticated requests cannot access protected employee, salary, salary history, or compensation data.
- Authenticated users can search and browse employee records and inspect employee details.
- Salary changes can be recorded and reviewed through salary history.
- Compensation summaries provide country- and department-level breakdowns grouped by currency.
- The seed process supports 10,000 employees.
- Core functionality and access-control behavior are covered by automated tests.
- The application has documented setup instructions and is deployed with a demo available for review before submission.
