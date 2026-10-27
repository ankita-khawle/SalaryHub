
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import EmployeeProfileModal from "./EmployeeProfileModal";
import type { EmployeeDetail } from "../types";

const employee = {
  id: 101,
  first_name: "Anita",
  last_name: "Shah",
  employee_code: "EMP-101",
  email: "anita@company.com",
  job_title: "Software Engineer",
  department_name: "Engineering",
  salary: "120000",
  currency: "INR",
  hire_date: "2022-05-10",
  is_active: true,
  salary_history: [
    {
      id: 1,
      previous_salary: null,
      new_salary: "100000",
      effective_date: "2022-05-10",
      changed_at: "2022-05-10T10:00:00Z",
    },
    {
      id: 2,
      previous_salary: "100000",
      new_salary: "120000",
      effective_date: "2024-01-01",
      changed_at: "2024-01-01T10:00:00Z",
    },
  ],
} as EmployeeDetail;

const formatSalary = (salary: string | number, currency: string) =>
  `${currency} ${Number(salary).toLocaleString("en-IN")}`;

const defaultProps = {
  selectedEmployee: employee,
  detailLoading: false,
  detailError: "",
  closeEmployee: vi.fn(),
  formatSalary,
  handleSalaryUpdate: vi.fn((event) => event.preventDefault()),
  salaryInput: "135000",
  setSalaryInput: vi.fn(),
  effectiveDate: "2026-10-27",
  setEffectiveDate: vi.fn(),
  salaryError: "",
  salaryMessage: "",
  savingSalary: false,
};

function renderModal(
  overrides: Partial<typeof defaultProps> = {},
) {
  return render(<EmployeeProfileModal {...defaultProps} {...overrides} />);
}

describe("EmployeeProfileModal", () => {
  it("renders nothing when there is no employee, loading, or error", () => {
    const { container } = renderModal({
      selectedEmployee: null,
      detailLoading: false,
      detailError: "",
    });

    expect(container.firstChild).toBeNull();
  });

  it("shows loading feedback while employee details are loading", () => {
    renderModal({
      selectedEmployee: null,
      detailLoading: true,
    });

    expect(
      screen.getByRole("dialog", { name: "Employee details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Loading employee details...")).toBeInTheDocument();
  });

  it("shows an employee details error", () => {
    renderModal({
      selectedEmployee: null,
      detailError: "Unable to load employee details.",
    });

    expect(
      screen.getByText("Unable to load employee details."),
    ).toBeInTheDocument();
  });

  it("renders the employee profile and summary information", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "Anita Shah" }),
    ).toBeInTheDocument();
    expect(screen.getByText("EMP-101")).toBeInTheDocument();
    expect(screen.getByText("anita@company.com")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    // expect(screen.getByText("2022-05-10")).toBeInTheDocument();
    expect(
      screen.getByText("2022-05-10", { selector: ".profile-grid strong" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("INR 1,20,000", { selector: ".profile-grid strong" })).toBeInTheDocument();
  });

  it("shows the employee initials in the avatar", () => {
    const { container } = renderModal();

    expect(container.querySelector(".profile-avatar")).toHaveTextContent("AS");
  });

  it("calls closeEmployee when the close button is clicked", async () => {
    const user = userEvent.setup();
    const closeEmployee = vi.fn();

    renderModal({ closeEmployee });

    await user.click(
      screen.getByRole("button", { name: "Close employee profile" }),
    );

    expect(closeEmployee).toHaveBeenCalledTimes(1);
  });

  it("calls closeEmployee when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const closeEmployee = vi.fn();

    const { container } = renderModal({ closeEmployee });

    await user.click(container.querySelector(".modal-backdrop")!);

    expect(closeEmployee).toHaveBeenCalledTimes(1);
  });

  it("does not close the modal when its content is clicked", async () => {
    const user = userEvent.setup();
    const closeEmployee = vi.fn();

    renderModal({ closeEmployee });

    await user.click(screen.getByRole("heading", { name: "Anita Shah" }));

    expect(closeEmployee).not.toHaveBeenCalled();
  });


  it("submits the salary form through handleSalaryUpdate", () => {
    const handleSalaryUpdate = vi.fn((event) => event.preventDefault());

    renderModal({ handleSalaryUpdate });

    fireEvent.submit(screen.getByRole("button", { name: "Save salary update" }).closest("form")!);

    expect(handleSalaryUpdate).toHaveBeenCalledTimes(1);
  });

  it("shows a salary validation error", () => {
    renderModal({ salaryError: "Salary must be greater than zero." });

    expect(
      screen.getByText("Salary must be greater than zero."),
    ).toBeInTheDocument();
  });

  it("shows a successful salary update message", () => {
    renderModal({ salaryMessage: "Salary updated successfully." });

    expect(
      screen.getByText("Salary updated successfully."),
    ).toBeInTheDocument();
  });

  it("disables the save button and shows Saving while a salary update is in progress", () => {
    renderModal({ savingSalary: true });

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("renders salary history including the initial salary", () => {
    renderModal();

    expect(screen.getByText("Salary history")).toBeInTheDocument();
    expect(screen.getByText("Initial salary")).toBeInTheDocument();
    expect(screen.getByText("INR 1,00,000")).toBeInTheDocument();
    expect(screen.getByText("INR 1,00,000 → INR 1,20,000")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("shows an empty message when salary history is empty", () => {
    renderModal({
      selectedEmployee: {
        ...employee,
        salary_history: [],
      } as EmployeeDetail,
    });

    expect(
      screen.getByText("No salary history available."),
    ).toBeInTheDocument();
  });

  it("renders inactive status for an inactive employee", () => {
    renderModal({
      selectedEmployee: {
        ...employee,
        is_active: false,
      } as EmployeeDetail,
    });

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("allows an initial salary history entry with a null previous salary", () => {
    renderModal({
      selectedEmployee: {
        ...employee,
        salary_history: [employee.salary_history[0]],
      } as EmployeeDetail,
    });

    expect(screen.getByText("Initial salary")).toBeInTheDocument();
  });
});
