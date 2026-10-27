import type { FormEvent } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Clock,
  Save,
  X,
} from "lucide-react";
import type { EmployeeDetail } from "../types";

interface EmployeeProfileModalProps {
  selectedEmployee: EmployeeDetail | null;
  detailLoading: boolean;
  detailError: string;
  closeEmployee: () => void;
  formatSalary: (salary: string | number, currency: string) => string;
  handleSalaryUpdate: (event: FormEvent<HTMLFormElement>) => void;
  salaryInput: string;
  setSalaryInput: (value: string) => void;
  effectiveDate: string;
  setEffectiveDate: (value: string) => void;
  salaryError: string;
  salaryMessage: string;
  savingSalary: boolean;
}

export default function EmployeeProfileModal({
  selectedEmployee,
  detailLoading,
  detailError,
  closeEmployee,
  formatSalary,
  handleSalaryUpdate,
  salaryInput,
  setSalaryInput,
  effectiveDate,
  setEffectiveDate,
  salaryError,
  salaryMessage,
  savingSalary,
}: EmployeeProfileModalProps) {
  if (!selectedEmployee && !detailLoading && !detailError) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={closeEmployee}>
      <section
        className="employee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">EMPLOYEE PROFILE</p>
            <h2 id="employee-modal-title">
              {selectedEmployee
                ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                : "Employee details"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            aria-label="Close employee profile"
            onClick={closeEmployee}
          >
            <X size={20} />
          </button>
        </div>

        {detailLoading ? (
          <p className="modal-feedback">Loading employee details...</p>
        ) : detailError ? (
          <p className="modal-error">{detailError}</p>
        ) : selectedEmployee ? (
          <>
            <div className="profile-summary">
              <div className="profile-avatar">
                {selectedEmployee.first_name.charAt(0)}
                {selectedEmployee.last_name.charAt(0)}
              </div>
              <div>
                <strong>{selectedEmployee.employee_code}</strong>
                <p>{selectedEmployee.email}</p>
                <p>{selectedEmployee.job_title}</p>
              </div>
            </div>

            <div className="profile-grid">
              <div>
                <span>Department</span>
                <strong>{selectedEmployee.department_name}</strong>
              </div>
              <div>
                <span>Current annual salary</span>
                <strong>
                  {formatSalary(
                    selectedEmployee.salary,
                    selectedEmployee.currency,
                  )}
                </strong>
              </div>
              <div>
                <span>Hire date</span>
                <strong>{selectedEmployee.hire_date}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>
                  {selectedEmployee.is_active ? "Active" : "Inactive"}
                </strong>
              </div>
            </div>

            <form className="salary-form" onSubmit={handleSalaryUpdate}>
              <h3>
                <CircleDollarSign size={18} />
                Update compensation
              </h3>

              <label htmlFor="new-salary">
                New annual salary ({selectedEmployee.currency})
              </label>
              <input
                id="new-salary"
                type="number"
                min="0.01"
                step="0.01"
                max="9999999999.99"
                required
                value={salaryInput}
                onChange={(event) => setSalaryInput(event.target.value)}
              />

              <label htmlFor="effective-date">
                <CalendarDays size={15} /> Effective date
              </label>
              <input
                id="effective-date"
                type="date"
                required
                value={effectiveDate}
                onChange={(event) => setEffectiveDate(event.target.value)}
              />

              {salaryError && (
                <p className="form-message error-message">{salaryError}</p>
              )}
              {salaryMessage && (
                <p className="form-message success-message">
                  {salaryMessage}
                </p>
              )}

              <button
                type="submit"
                className="save-button"
                disabled={savingSalary}
              >
                <Save size={16} />
                {savingSalary ? "Saving..." : "Save salary update"}
              </button>
            </form>

            <div className="history-section">
              <h3>
                <Clock size={18} />
                Salary history
              </h3>

              {selectedEmployee.salary_history.length === 0 ? (
                <p className="history-empty">
                  No salary history available.
                </p>
              ) : (
                <div className="history-list">
                  {selectedEmployee.salary_history.map((item) => (
                    <div className="history-item" key={item.id}>
                      <div>
                        <strong>
                          {formatSalary(
                            item.new_salary,
                            selectedEmployee.currency,
                          )}
                        </strong>
                        <p>
                          {item.previous_salary == null
                            ? "Initial salary"
                            : `${formatSalary(item.previous_salary, selectedEmployee.currency)} → ${formatSalary(item.new_salary, selectedEmployee.currency)}`}
                        </p>
                      </div>
                      <div className="history-date">
                        <span>{item.effective_date}</span>
                        <small>
                          {new Date(item.changed_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}