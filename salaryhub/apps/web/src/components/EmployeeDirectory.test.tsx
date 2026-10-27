
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import EmployeeDirectory from "./EmployeeDirectory";
import type { Department, Employee } from "../types";

const departments = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Human Resources" },
] as Department[];

const employees = [
  {
    id: 101,
    first_name: "Anita",
    last_name: "Shah",
    employee_code: "EMP-101",
    email: "anita@company.com",
    job_title: "Software Engineer",
    department_id: 1,
    country: "India",
    salary: "120000",
    currency: "INR",
    is_active: true,
  },
  {
    id: 102,
    first_name: "Rahul",
    last_name: "Mehta",
    employee_code: "EMP-102",
    email: "rahul@company.com",
    job_title: "HR Manager",
    department_id: 2,
    country: "India",
    salary: "90000",
    currency: "INR",
    is_active: false,
  },
] as Employee[];

const defaultProps = {
  employees,
  departments,
  total: 25,
  activeCount: 1,
  loading: false,
  error: "",
  search: "",
  setSearch: vi.fn(),
  departmentId: "",
  setDepartmentId: vi.fn(),
  activeFilter: "",
  setActiveFilter: vi.fn(),
  resetFilters: vi.fn(),
  page: 1,
  setPage: vi.fn(),
  totalPages: 3,
  openEmployee: vi.fn(),
  formatSalary: (salary: string | number, currency: string) =>
    `${currency} ${Number(salary).toLocaleString("en-IN")}`,
};

function renderDirectory(
  overrides: Partial<typeof defaultProps> = {},
) {
  return render(
    <EmployeeDirectory {...defaultProps} {...overrides} />,
  );
}

describe("EmployeeDirectory", () => {
  it("renders the heading, subtitle, and summary cards", () => {
    renderDirectory();

    expect(
      screen.getByRole("heading", { name: "Employees" }),
    ).toBeInTheDocument();
    expect(screen.getByText("25 employees found")).toBeInTheDocument();
    expect(screen.getByText("Total employees")).toBeInTheDocument();
    expect(screen.getByText("Departments")).toBeInTheDocument();
    expect(screen.getByText("Active on this page")).toBeInTheDocument();

    expect(screen.getByText("Matching current filters")).toBeInTheDocument();
    expect(screen.getByText("Across the organization")).toBeInTheDocument();
    expect(screen.getByText("Out of 2 displayed")).toBeInTheDocument();
  });

  it("renders employee information and department names", () => {
    renderDirectory();
    const employeeTable = screen.getByRole("table");

    expect(screen.getByRole("button", { name: "Anita Shah" })).toBeInTheDocument();
    expect(screen.getByText("EMP-101 · anita@company.com")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(
      within(employeeTable).getByRole("cell", { name: "Engineering" }),
    ).toBeInTheDocument();

    expect(
      within(employeeTable).getByRole("cell", { name: "Human Resources" }),
    ).toBeInTheDocument();

    expect(screen.getByText("HR Manager")).toBeInTheDocument();
    expect(screen.getByText("INR 1,20,000")).toBeInTheDocument();
    expect(screen.getByText("INR 90,000")).toBeInTheDocument();
    expect(screen.getAllByText("India")).toHaveLength(2);
  });

  it("shows active and inactive employee statuses", () => {
    renderDirectory();

    expect(
      screen.getByText("Active", { selector: ".status-pill" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Inactive", { selector: ".status-pill" }),
    ).toBeInTheDocument();

  });

  it("shows a loading row", () => {
    renderDirectory({ loading: true });

    expect(screen.getByText("Loading employees...")).toBeInTheDocument();
  });

  it("shows the empty state when no employees are provided", () => {
    renderDirectory({ employees: [], activeCount: 0 });

    expect(
      screen.getByText("No employees found. Try adjusting your filters."),
    ).toBeInTheDocument();
  });

  it("displays API errors", () => {
    renderDirectory({ error: "Unable to load employees." });

    expect(
      screen.getByText("Unable to load employees."),
    ).toBeInTheDocument();
  });

  it("clears a populated search", async () => {
    const user = userEvent.setup();
    const setSearch = vi.fn();
    const setPage = vi.fn();

    renderDirectory({
      search: "Anita",
      setSearch,
      setPage,
    });

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(setSearch).toHaveBeenCalledWith("");
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the department filter and resets the page", async () => {
    const user = userEvent.setup();
    const setDepartmentId = vi.fn();
    const setPage = vi.fn();

    renderDirectory({ setDepartmentId, setPage });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filter by department" }),
      "2",
    );

    expect(setDepartmentId).toHaveBeenCalledWith("2");
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("updates the employee status filter and resets the page", async () => {
    const user = userEvent.setup();
    const setActiveFilter = vi.fn();
    const setPage = vi.fn();

    renderDirectory({ setActiveFilter, setPage });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filter by employee status" }),
      "false",
    );

    expect(setActiveFilter).toHaveBeenCalledWith("false");
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("shows Reset when filters are applied and calls resetFilters", async () => {
    const user = userEvent.setup();
    const resetFilters = vi.fn();

    renderDirectory({
      search: "Anita",
      resetFilters,
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(resetFilters).toHaveBeenCalledTimes(1);
  });

  it("opens an employee profile when their name is clicked", async () => {
    const user = userEvent.setup();
    const openEmployee = vi.fn();

    renderDirectory({ openEmployee });

    await user.click(screen.getByRole("button", { name: "Anita Shah" }));

    expect(openEmployee).toHaveBeenCalledWith(101);
  });

  it("shows a fallback department label when the department is missing", () => {
    const employeeWithoutDepartment = {
      ...employees[0],
      department_id: 999,
    } as Employee;

    renderDirectory({ employees: [employeeWithoutDepartment] });

    expect(screen.getByText("Department 999")).toBeInTheDocument();
  });

  it("shows pagination information and disables Previous on the first page", () => {
    renderDirectory();

    expect(screen.getByText("Showing 1–10 of 25")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("advances and goes back between pages", async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();

    const { rerender } = render(
      <EmployeeDirectory {...defaultProps} page={2} setPage={setPage} />,
    );

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(setPage).toHaveBeenCalledWith(expect.any(Function));
    expect(setPage.mock.calls[0][0](2)).toBe(1);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(setPage).toHaveBeenCalledTimes(2);
    expect(setPage.mock.calls[1][0](2)).toBe(3);

    rerender(
      <EmployeeDirectory {...defaultProps} page={3} setPage={setPage} />,
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("disables pagination while loading", () => {
    renderDirectory({ loading: true });

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("shows No results when total is zero", () => {
    renderDirectory({
      total: 0,
      employees: [],
      activeCount: 0,
      totalPages: 0,
    });

    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
