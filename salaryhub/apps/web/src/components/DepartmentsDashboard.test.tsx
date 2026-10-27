
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import DepartmentsDashboard from "./DepartmentsDashboard";
import { getDepartments } from "../api/employees";

vi.mock("../api/employees", () => ({
  getDepartments: vi.fn(),
}));

const mockDepartments = [
  { id: 1, name: "Engineering", employee_count: 5  },
  { id: 2, name: "Human Resources", employee_count: 6  },
  { id: 3, name: "Finance", employee_count: 3 },
];

const mockedGetDepartments = vi.mocked(getDepartments);

describe("DepartmentsDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the page heading and subtitle", async () => {
    mockedGetDepartments.mockResolvedValue(mockDepartments);

    render(<DepartmentsDashboard />);

    expect(
      screen.getByRole("heading", { name: "Departments" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "View the departments configured across your organization.",
      ),
    ).toBeInTheDocument();

    await screen.findByRole("heading", { name: "Engineering" });
  });

  it("shows the loading state while departments are being fetched", () => {
    mockedGetDepartments.mockReturnValue(new Promise(() => {}));

    render(<DepartmentsDashboard />);

    expect(screen.getByText("Loading departments...")).toBeInTheDocument();
    expect(screen.getByText("0 departments")).toBeInTheDocument();
  });

  it("renders department cards and the department count", async () => {
    mockedGetDepartments.mockResolvedValue(mockDepartments);

    render(<DepartmentsDashboard />);

    expect(
      await screen.findByRole("heading", { name: "Engineering" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Human Resources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Finance" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Department ID: 1")).toBeInTheDocument();
    expect(screen.getByText("Department ID: 2")).toBeInTheDocument();
    expect(screen.getByText("Department ID: 3")).toBeInTheDocument();
    expect(screen.getByText("3 departments")).toBeInTheDocument();
  });

  it("shows an empty state when no departments are returned", async () => {
    mockedGetDepartments.mockResolvedValue([]);

    render(<DepartmentsDashboard />);

    expect(
      await screen.findByText("No departments found."),
    ).toBeInTheDocument();
    expect(screen.getByText("0 departments")).toBeInTheDocument();
  });

  it("shows an error and allows retrying the request", async () => {
    const user = userEvent.setup();

    mockedGetDepartments
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockDepartments);

    render(<DepartmentsDashboard />);

    expect(
      await screen.findByText(
        "Unable to load departments. Please try again.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(
      await screen.findByRole("heading", { name: "Engineering" }),
    ).toBeInTheDocument();

    expect(mockedGetDepartments).toHaveBeenCalledTimes(2);
  });

  it("calls the departments API on mount", async () => {
    mockedGetDepartments.mockResolvedValue([]);

    render(<DepartmentsDashboard />);

    await waitFor(() => {
      expect(mockedGetDepartments).toHaveBeenCalledTimes(1);
    });
  });
});
