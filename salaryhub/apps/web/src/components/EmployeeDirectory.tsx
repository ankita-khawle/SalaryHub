import type { Dispatch, SetStateAction } from "react";
import {
  Users,
  Building2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Department, Employee } from "../types";
interface EmployeeDirectoryProps {
  employees: Employee[];
  departments: Department[];
  total: number;
  activeCount: number;
  loading: boolean;
  error: string;
  search: string;
  setSearch: (value: string) => void;
  departmentId: string;
  setDepartmentId: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  resetFilters: () => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  openEmployee: (employeeId: number) => void;
  formatSalary: (salary: string | number, currency: string) => string;
}

const PAGE_SIZE = 10;

export default function EmployeeDirectory({
  employees,
  departments,
  total,
  activeCount,
  loading,
  error,
  search,
  setSearch,
  departmentId,
  setDepartmentId,
  activeFilter,
  setActiveFilter,
  resetFilters,
  page,
  setPage,
  totalPages,
  openEmployee,
  formatSalary,
}: EmployeeDirectoryProps) {
  return (
    <div>
      <div className="page-heading">
            <div>
                 <p className="eyebrow">PEOPLE MANAGEMENT</p>
                 <h1>Employees</h1>
                 <p className="subtitle">
                   Manage your workforce, departments, and compensation.
                 </p>
               </div>
               <div className="employee-total">
                 <Users size={17} />
                 <span>{total.toLocaleString("en-IN")} employees found</span>
               </div>
             </div>

             <div className="stats-grid">
               <article className="stat-card">
                 <div className="stat-icon blue"><Users size={20} /></div>
                 <div>
                   <p>Total employees</p>
                   <h2>{total.toLocaleString("en-IN")}</h2>
                   <span>Matching current filters</span>
                 </div>
               </article>
               <article className="stat-card">
                 <div className="stat-icon purple"><Building2 size={20} /></div>
                 <div>
                   <p>Departments</p>
                   <h2>{departments.length}</h2>
                   <span>Across the organization</span>
                 </div>
               </article>
               <article className="stat-card">
                 <div className="stat-icon green"><Users size={20} /></div>
                 <div>
                   <p>Active on this page</p>
                   <h2>{activeCount}</h2>
                   <span>Out of {employees.length} displayed</span>
                 </div>
               </article>
             </div>

             <section className="employee-panel">
               <div className="panel-heading">
                 <div>
                   <h2>Employee directory</h2>
                   <p>Search and filter employee records.</p>
                 </div>
               </div>

               <div className="filters">
                 <div className="search-box">
                   <Search size={18} />
                   <input
                      aria-label="Search employees"
                      placeholder="Search name, email or employee ID..."
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                    {search && (
                      <button
                        className="clear-search"
                        aria-label="Clear search"
                        onClick={() => {
                          setSearch("");
                          setPage(1);
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <select
                    aria-label="Filter by department"
                    value={departmentId}
                    onChange={(event) => {
                      setDepartmentId(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All departments</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by employee status"
                    value={activeFilter}
                    onChange={(event) => {
                      setActiveFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>

                  {(search || departmentId || activeFilter) && (
                    <button className="reset-button" onClick={resetFilters}>
                      Reset
                    </button>
                  )}
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>EMPLOYEE</th>
                        <th>ROLE</th>
                        <th>DEPARTMENT</th>
                        <th>COUNTRY</th>
                        <th>ANNUAL SALARY</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="empty-state">Loading employees...</td>
                        </tr>
                      ) : employees.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-state">
                            No employees found. Try adjusting your filters.
                          </td>
                        </tr>
                      ) : (
                        employees.map((employee) => {
                          const department = departments.find(
                            (item) => item.id === employee.department_id,
                          );

                          return (
                            <tr key={employee.id}>
                              <td>
                                <div className="employee-cell">
                                  <div className="employee-avatar">
                                    {employee.first_name.charAt(0)}
                                    {employee.last_name.charAt(0)}
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      className="employee-open-button"
                                      onClick={() =>void openEmployee(employee.id)}
                                    >
                                      {employee.first_name} {employee.last_name}
                                    </button>
                                    <span>{employee.employee_code} · {employee.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{employee.job_title}</td>
                              <td>{department?.name ?? `Department ${employee.department_id}`}</td>
                              <td>{employee.country}</td>
                              <td className="salary-cell">
                                {formatSalary(employee.salary, employee.currency)}
                              </td>
                              <td>
                                <span className={`status-pill ${employee.is_active ? "active-status" : "inactive-status"}`}>
                                  <span />
                                  {employee.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <span>
                    {total === 0
                      ? "No results"
                      : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total.toLocaleString("en-IN")}`}
                  </span>
                  <div className="pagination-actions">
                    <button
                      aria-label="Previous page"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                      aria-label="Next page"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
            </section>

    </div>
  );
}