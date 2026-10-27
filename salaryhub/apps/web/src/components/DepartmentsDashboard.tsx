import { useEffect, useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { getDepartments } from "../api/employees";
import type { Department } from "../types";

export default function DepartmentsDashboard() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setError("Unable to load departments. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDepartments();
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ORGANIZATION</p>
          <h1>Departments</h1>
          <p className="subtitle">
            View the departments configured across your organization.
          </p>
        </div>

        <div className="employee-total">
          <Building2 size={17} />
          <span>{departments.length} departments</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button
            type="button"
            className="reset-button"
            onClick={() => void loadDepartments()}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="employee-panel">
          <p className="empty-state">Loading departments...</p>
        </div>
      ) : !error && departments.length === 0 ? (
        <div className="employee-panel">
          <p className="empty-state">No departments found.</p>
        </div>
      ) : !error ? (
        <section className="department-grid">
          {departments.map((department) => (
            <article className="department-card" key={department.id}>
              <div className="department-card-icon">
                <Building2 size={21} />
              </div>

              <div>
                <h2>{department.name}</h2>
                <p>Department ID: {department.id}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}