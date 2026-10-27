
import { useEffect, useState } from "react";
import {
  Users,
  Globe2,
  Building2,
} from "lucide-react";
import { getCompensationSummary } from "../api/employees";
import type {
  CompensationSummary,
  CountryCompensationSummary,
  DepartmentCompensationSummary,
} from "../types";

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

function CompensationTable({
  title,
  description,
  rows,
  type,
}: {
  title: string;
  description: string;
  rows: CountryCompensationSummary[] | DepartmentCompensationSummary[];
  type: "country" | "department";
}) {
  if (rows.length === 0) {
    return (
      <section className="compensation-table">
        <div className="panel-heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="compensation-empty">
          No compensation data available.
        </div>
      </section>
    );
  }

  return (
    <section className="compensation-table">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {type === "country" ? (
                <th>COUNTRY</th>
              ) : (
                <>
                  <th>DEPARTMENT</th>
                  <th>COUNTRY</th>
                </>
              )}
              <th>EMPLOYEES</th>
              <th>AVERAGE SALARY</th>
              <th>MINIMUM</th>
              <th>MAXIMUM</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={
                  type === "country"
                    ? `${row.country}-${row.currency}`
                    : `${row.department_id}-${row.country}-${row.currency}`
                }
              >
                {type === "country" ? (
                  <td>{row.country}</td>
                ) : (
                  <>
                    <td>{row.department_name}</td>
                    <td>{row.country}</td>
                  </>
                )}
                <td>{row.employee_count.toLocaleString("en-IN")}</td>
                <td className="compensation-value">
                  {formatSalary(row.average_salary, row.currency)}
                </td>
                <td>{formatSalary(row.min_salary, row.currency)}</td>
                <td>{formatSalary(row.max_salary, row.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CompensationDashboard() {
  const [summary, setSummary] = useState<CompensationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const data = await getCompensationSummary();

        if (!cancelled) {
          setSummary(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load compensation insights. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeEmployeeCount =
    summary?.by_country.reduce(
      (total, country) => total + country.employee_count,
      0,
    ) ?? 0;

  const countryCount = summary?.by_country.length ?? 0;
  const departmentGroupCount = summary?.by_department.length ?? 0;

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKFORCE ANALYTICS</p>
          <h1>Compensation Insights</h1>
          <p className="subtitle">
            Explore salary distribution across countries and departments.
          </p>
        </div>
      </div>

      {error && <div className="compensation-error">{error}</div>}

      {loading ? (
        <div className="compensation-loading">
          Loading compensation insights...
        </div>
      ) : summary ? (
        <>
        <div className="compensation-grid">
        <article className="compensation-card">
            <div className="compensation-card-header">
            <div className="compensation-card-icon blue">
                <Users size={20} />
            </div>
            <span className="compensation-card-label">WORKFORCE</span>
            </div>
            <p className="compensation-card-title">Active employees</p>
            <h2>{activeEmployeeCount.toLocaleString("en-IN")}</h2>
            <p className="compensation-card-description">
            Active employees included in the analysis
            </p>
        </article>

        <article className="compensation-card">
            <div className="compensation-card-header">
            <div className="compensation-card-icon purple">
                <Globe2 size={20} />
            </div>
            <span className="compensation-card-label">GLOBAL REACH</span>
            </div>
            <p className="compensation-card-title">Countries represented</p>
            <h2>{countryCount}</h2>
            <p className="compensation-card-description">
            Countries with active employee records
            </p>
        </article>

        <article className="compensation-card">
            <div className="compensation-card-header">
            <div className="compensation-card-icon green">
                <Building2 size={20} />
            </div>
            <span className="compensation-card-label">ORGANIZATION</span>
            </div>
            <p className="compensation-card-title">Department groups</p>
            <h2>{departmentGroupCount}</h2>
            <p className="compensation-card-description">
            Department and country combinations
            </p>
        </article>
        </div>


          <CompensationTable
            title="Compensation by country"
            description="Salary statistics for active employees, shown in each country's currency."
            rows={summary.by_country}
            type="country"
          />

          <CompensationTable
            title="Compensation by department"
            description="Compare salary ranges by department and country."
            rows={summary.by_department}
            type="department"
          />
        </>
      ) : null}
    </>
  );
}
