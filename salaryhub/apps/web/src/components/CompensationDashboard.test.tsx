
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import CompensationDashboard from "./CompensationDashboard";
import { getCompensationSummary } from "../api/employees";
import type { CompensationSummary } from "../types";

vi.mock("../api/employees", () => ({
  getCompensationSummary: vi.fn(),
}));

const mockSummary = {
  by_country: [
    {
      country: "India",
      currency: "INR",
      employee_count: 120,
      average_salary: "120000",
      min_salary: "50000",
      max_salary: "250000",
    },
    {
      country: "United States",
      currency: "USD",
      employee_count: 80,
      average_salary: "90000",
      min_salary: "60000",
      max_salary: "150000",
    },
  ],
  by_department: [
    {
      department_id: 1,
      department_name: "Engineering",
      country: "India",
      currency: "INR",
      employee_count: 70,
      average_salary: "150000",
      min_salary: "80000",
      max_salary: "250000",
    },
    {
      department_id: 2,
      department_name: "Human Resources",
      country: "United States",
      currency: "USD",
      employee_count: 20,
      average_salary: "75000",
      min_salary: "60000",
      max_salary: "100000",
    },
  ],
} as CompensationSummary;

const mockedGetSummary = vi.mocked(getCompensationSummary);

describe("CompensationDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("page rendering", () => {
    it("renders the page heading and description", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      expect(
        screen.getByRole("heading", {
          name: "Compensation Insights",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Explore salary distribution across countries and departments.",
        ),
      ).toBeInTheDocument();

      await screen.findByText("Compensation by country");
    });
  });

  describe("loading state", () => {
    it("shows a loading message while the API request is pending", () => {
      mockedGetSummary.mockReturnValue(new Promise(() => {}));

      render(<CompensationDashboard />);

      expect(
        screen.getByText("Loading compensation insights..."),
      ).toBeInTheDocument();
    });

    it("hides the loading message after the API request succeeds", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      await screen.findByText("Compensation by country");

      expect(
        screen.queryByText("Loading compensation insights..."),
      ).not.toBeInTheDocument();
    });
  });

  describe("compensation summary cards", () => {
    it("displays the total employee count from country summaries", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      await screen.findByText("Compensation by country");

      const workforceCard = screen
        .getByText("Active employees")
        .closest("article");

      expect(workforceCard).not.toBeNull();
      expect(
        within(workforceCard!).getByRole("heading", { name: "200" }),
      ).toBeInTheDocument();
    });

    it("displays the number of countries represented", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      await screen.findByText("Compensation by country");

      const countryCard = screen
        .getByText("Countries represented")
        .closest("article");

      expect(countryCard).not.toBeNull();
      expect(
        within(countryCard!).getByRole("heading", { name: "2" }),
      ).toBeInTheDocument();
    });

    it("displays the number of department-country groups", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      await screen.findByText("Compensation by country");

      const departmentCard = screen
        .getByText("Department groups")
        .closest("article");

      expect(departmentCard).not.toBeNull();
      expect(
        within(departmentCard!).getByRole("heading", { name: "2" }),
      ).toBeInTheDocument();
    });
  });

  describe("compensation by country", () => {
    it("renders country names, employee counts, and salary statistics", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      const section = await screen.findByText("Compensation by country");
      const countrySection = section.closest("section");

      expect(countrySection).not.toBeNull();

      const table = within(countrySection!).getByRole("table");

      expect(within(table).getByText("COUNTRY")).toBeInTheDocument();
      expect(within(table).getByText("India")).toBeInTheDocument();
      expect(
        within(table).getByText("United States"),
      ).toBeInTheDocument();

      expect(within(table).getByText("120")).toBeInTheDocument();
      expect(within(table).getByText("80")).toBeInTheDocument();

      expect(
        within(table).getByText("AVERAGE SALARY"),
      ).toBeInTheDocument();
      expect(within(table).getByText("MINIMUM")).toBeInTheDocument();
      expect(within(table).getByText("MAXIMUM")).toBeInTheDocument();
    });

    it("formats INR salary values using Indian number grouping", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      const section = await screen.findByText("Compensation by country");
      const countrySection = section.closest("section")!;
      const indiaRow = within(countrySection)
        .getByText("India")
        .closest("tr");

      expect(indiaRow).not.toBeNull();
      expect(indiaRow).toHaveTextContent(/₹1,20,000/);
      expect(indiaRow).toHaveTextContent(/₹50,000/);
      expect(indiaRow).toHaveTextContent(/₹2,50,000/);
    });

    it("formats USD salary values using the correct currency", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      const section = await screen.findByText("Compensation by country");
      const countrySection = section.closest("section")!;
      const usRow = within(countrySection)
        .getByText("United States")
        .closest("tr");

      expect(usRow).not.toBeNull();
      expect(usRow).toHaveTextContent(/\$90,000/);
      expect(usRow).toHaveTextContent(/\$60,000/);
      expect(usRow).toHaveTextContent(/\$150,000/);
    });
  });

  describe("compensation by department", () => {
    it("renders department names and country information", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      const section = await screen.findByText(
        "Compensation by department",
      );
      const departmentSection = section.closest("section");

      expect(departmentSection).not.toBeNull();

      const table = within(departmentSection!).getByRole("table");

      expect(within(table).getByText("DEPARTMENT")).toBeInTheDocument();
      expect(within(table).getByText("COUNTRY")).toBeInTheDocument();

      expect(
        within(table).getByText("Engineering"),
      ).toBeInTheDocument();

      expect(
        within(table).getByText("Human Resources"),
      ).toBeInTheDocument();

      expect(within(table).getByText("India")).toBeInTheDocument();
      expect(
        within(table).getByText("United States"),
      ).toBeInTheDocument();
    });

    it("renders salary statistics for each department", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      const section = await screen.findByText(
        "Compensation by department",
      );
      const table = within(section.closest("section")!).getByRole("table");

      const engineeringRow = within(table)
        .getByText("Engineering")
        .closest("tr");

      expect(engineeringRow).not.toBeNull();
      expect(engineeringRow).toHaveTextContent(/₹1,50,000/);
      expect(engineeringRow).toHaveTextContent(/₹80,000/);
      expect(engineeringRow).toHaveTextContent(/₹2,50,000/);
    });
  });

  describe("empty data", () => {
    it("shows empty-state messages when both datasets are empty", async () => {
      mockedGetSummary.mockResolvedValue({
        by_country: [],
        by_department: [],
      } as CompensationSummary);

      render(<CompensationDashboard />);

      await waitFor(() => {
        expect(
          screen.queryByText("Loading compensation insights..."),
        ).not.toBeInTheDocument();
      });

      expect(
        screen.getAllByText("No compensation data available."),
      ).toHaveLength(2);
    });

    it("shows an empty state for countries when only department data exists", async () => {
      mockedGetSummary.mockResolvedValue({
        by_country: [],
        by_department: mockSummary.by_department,
      } as CompensationSummary);

      render(<CompensationDashboard />);

      expect(
        await screen.findByText("Compensation by department"),
      ).toBeInTheDocument();

      const countrySection = screen
        .getByText("Compensation by country")
        .closest("section");

      expect(countrySection).toHaveTextContent(
        "No compensation data available.",
      );
    });

    it("shows an empty state for departments when only country data exists", async () => {
      mockedGetSummary.mockResolvedValue({
        by_country: mockSummary.by_country,
        by_department: [],
      } as CompensationSummary);

      render(<CompensationDashboard />);

      expect(
        await screen.findByText("Compensation by country"),
      ).toBeInTheDocument();

      const departmentSection = screen
        .getByText("Compensation by department")
        .closest("section");

      expect(departmentSection).toHaveTextContent(
        "No compensation data available.",
      );
    });
  });

  describe("API errors", () => {
    it("displays an error message when the API request fails", async () => {
      mockedGetSummary.mockRejectedValue(new Error("Network error"));

      render(<CompensationDashboard />);

      expect(
        await screen.findByText(
          "Unable to load compensation insights. Please try again.",
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByText("Loading compensation insights..."),
      ).not.toBeInTheDocument();
    });

    it("does not render summary cards when the API request fails", async () => {
      mockedGetSummary.mockRejectedValue(new Error("Server error"));

      render(<CompensationDashboard />);

      await screen.findByText(
        "Unable to load compensation insights. Please try again.",
      );

      expect(
        screen.queryByText("Active employees"),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("Compensation by country"),
      ).not.toBeInTheDocument();
    });

    it("calls the compensation summary API once on mount", async () => {
      mockedGetSummary.mockResolvedValue(mockSummary);

      render(<CompensationDashboard />);

      await screen.findByText("Compensation by country");

      expect(mockedGetSummary).toHaveBeenCalledTimes(1);
    });
  });
});
