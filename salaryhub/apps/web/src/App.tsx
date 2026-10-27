

import { useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  CircleDollarSign,
  Users,
} from "lucide-react";
import {
  getDepartments,
  getEmployees,
  getEmployee,
  updateEmployeeSalary,
} from "./api/employees";
import type { Department, Employee, EmployeeDetail } from "./types";
import CompensationDashboard from "./components/CompensationDashboard";
import EmployeeProfileModal from "./components/EmployeeProfileModal";
import EmployeeDirectory from "./components/EmployeeDirectory";
import DepartmentsDashboard from "./components/DepartmentsDashboard";
import "./App.css";
import { getCurrentUser, logout } from "./api/auth";
import LoginPage from "./components/LoginPage";

const PAGE_SIZE = 10;

function formatSalary(salary: string | number, currency: string) {
  const localeByCurrency: Record<string, string> = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    CAD: "en-CA",
    AUD: "en-AU",
  };

  return new Intl.NumberFormat(localeByCurrency[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(salary));
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<
    "employees" | "departments" | "compensation"
  >("employees");

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [salaryInput, setSalaryInput] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryMessage, setSalaryMessage] = useState("");
  const [salaryError, setSalaryError] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUserEmail(user.email))
      .catch(() => setUserEmail(null))
      .finally(() => setAuthLoading(false));
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUserEmail(null);
      setSelectedEmployee(null);
      setError("");
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }
 useEffect(() => {
  if (!userEmail) return;

  getDepartments()
    .then(setDepartments)
    .catch(() => setError("Unable to load departments. Check the API server."));
}, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    getEmployees({
      q: search.trim() || undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      is_active: activeFilter === "" ? undefined : activeFilter === "true",
      page,
      page_size: PAGE_SIZE,
    })
      .then((result) => {
        if (cancelled) return;
        setEmployees(result.items);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load employees. Check that the API and database are running.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, departmentId, activeFilter, page, userEmail]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCount = employees.filter((employee) => employee.is_active).length;

  function resetFilters() {
    setSearch("");
    setDepartmentId("");
    setActiveFilter("");
    setPage(1);
  }


  async function openEmployee(employeeId: number) {
    setSelectedEmployee(null);
    setDetailLoading(true);
    setDetailError("");
    setSalaryMessage("");
    setSalaryError("");

    try {
      const employee = await getEmployee(employeeId);
      setSelectedEmployee(employee);
      setSalaryInput(employee.salary);
    } catch {
      setDetailError("Unable to load employee details. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeEmployee() {
    setSelectedEmployee(null);
    setDetailError("");
    setSalaryMessage("");
    setSalaryError("");
  }

  async function handleSalaryUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEmployee) return;

    const amount = Number(salaryInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      setSalaryError("Enter a valid salary greater than zero.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(salaryInput.trim())) {
      setSalaryError("Salary can have at most two decimal places.");
      return;
    }

    if (amount === Number(selectedEmployee.salary)) {
      setSalaryError("Enter a salary different from the current salary.");
      return;
    }


    const confirmed = window.confirm(
      `Confirm salary update for ${selectedEmployee.first_name} ${selectedEmployee.last_name}?\n\n` +
        `Current salary: ${formatSalary(selectedEmployee.salary, selectedEmployee.currency)}\n` +
        `New salary: ${formatSalary(salaryInput.trim(), selectedEmployee.currency)}\n` +
        `Effective date: ${effectiveDate}`,
    );

    if (!confirmed) {
      return;
    }


    setSavingSalary(true);
    setSalaryError("");
    setSalaryMessage("");

    try {
      await updateEmployeeSalary(
        selectedEmployee.id,
        salaryInput.trim(),
        effectiveDate,
      );

      const refreshedEmployee = await getEmployee(selectedEmployee.id);
      setSelectedEmployee(refreshedEmployee);
      setSalaryInput(refreshedEmployee.salary);
      setSalaryMessage("Salary updated and audit history recorded.");

      const refreshedList = await getEmployees({
        q: search.trim() || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        is_active: activeFilter === "" ? undefined : activeFilter === "true",
        page,
        page_size: PAGE_SIZE,
      });

      setEmployees(refreshedList.items);
      setTotal(refreshedList.total);
    } catch {
      setSalaryError(
        "Salary update failed. Check the entered values and try again.",
      );
    } finally {
      setSavingSalary(false);
    }
  }

  if (authLoading) {
    return <div className="app-loading">Loading SalaryHub...</div>;
  }

  if (!userEmail) {
    return <LoginPage onLogin={setUserEmail} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SalaryHub</strong>
            <span>ACME CORPORATION</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <button
          type="button"
          className={`nav-item ${activeView === "employees" ? "active" : ""}`}
          onClick={() => setActiveView("employees")}
        >
          <Users size={18} />
          <span>Employees</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeView === "departments" ? "active" : ""}`}
          onClick={() => setActiveView("departments")}
        >
          <Building2 size={18} />
          <span>Departments</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeView === "compensation" ? "active" : ""}`}
          onClick={() => setActiveView("compensation")}
        >
          <CircleDollarSign size={18} />
          <span>Compensation</span>
        </button>

        <div className="sidebar-footer">
          <div className="avatar">HR</div>
          <div>
            <strong>HR Manager</strong>
            <span>{userEmail}</span>
          </div>
        </div>
        <button
            type="button"
            className="nav-item"
            onClick={handleLogout}
          >
            Sign out
          </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>
            People /{" "}
            {activeView === "employees"
              ? "Employees"
              : activeView === "compensation"
                ? "Compensation"
                : "Departments"}
          </span>
          <div className="topbar-right">
            <span className="status-dot" />
            <span>Connected to SalaryHub API</span>
          </div>
        </header>

        <section className="page-content">

          {activeView === "employees" ? (
            <EmployeeDirectory
              employees={employees}
              departments={departments}
              total={total}
              activeCount={activeCount}
              loading={loading}
              error={error}
              search={search}
              setSearch={setSearch}
              departmentId={departmentId}
              setDepartmentId={setDepartmentId}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              resetFilters={resetFilters}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              openEmployee={openEmployee}
              formatSalary={formatSalary}
            />
          ) : activeView === "compensation" ? (
            <CompensationDashboard />
          ) : (
            <DepartmentsDashboard />
          )}



          <EmployeeProfileModal
            selectedEmployee={selectedEmployee}
            detailLoading={detailLoading}
            detailError={detailError}
            closeEmployee={closeEmployee}
            formatSalary={formatSalary}
            handleSalaryUpdate={handleSalaryUpdate}
            salaryInput={salaryInput}
            setSalaryInput={setSalaryInput}
            effectiveDate={effectiveDate}
            setEffectiveDate={setEffectiveDate}
            salaryError={salaryError}
            salaryMessage={salaryMessage}
            savingSalary={savingSalary}
          />

          <footer className="page-footer">
            ACME SalaryHub · Employee and compensation management
          </footer>
        </section>
      </main>
    </div>
  );
}
