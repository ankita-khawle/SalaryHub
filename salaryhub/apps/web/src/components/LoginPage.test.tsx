
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import LoginPage from "./LoginPage";
import { login } from "../api/auth";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the SalaryHub login form", () => {
    render(<LoginPage onLogin={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "SalaryHub" })).toBeInTheDocument();
    expect(screen.getByText("ACME CORPORATION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(screen.getByText("Authorized HR Manager access only")).toBeInTheDocument();
  });

  it("requires an email and password", () => {
    render(<LoginPage onLogin={vi.fn()} />);

    expect(screen.getByLabelText("Work email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByLabelText("Work email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("submits the entered credentials and calls onLogin with the returned email", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    mockedLogin.mockResolvedValue({
      email: "hr@company.com",
    } as Awaited<ReturnType<typeof login>>);

    render(<LoginPage onLogin={onLogin} />);

    await user.type(screen.getByLabelText("Work email"), "hr@company.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "hr@company.com",
        password: "correct-password",
      });
      expect(onLogin).toHaveBeenCalledWith("hr@company.com");
    });
  });

  it("shows an error when login fails", async () => {
    const user = userEvent.setup();

    mockedLogin.mockRejectedValue(new Error("Unauthorized"));

    render(<LoginPage onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText("Work email"), "hr@company.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Invalid email or password. Please try again.");
  });

  it("does not call onLogin when authentication fails", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    mockedLogin.mockRejectedValue(new Error("Unauthorized"));

    render(<LoginPage onLogin={onLogin} />);

    await user.type(screen.getByLabelText("Work email"), "hr@company.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByRole("alert");

    expect(onLogin).not.toHaveBeenCalled();
  });

  it("shows the signing-in state while authentication is pending", async () => {
    const user = userEvent.setup();

    mockedLogin.mockReturnValue(new Promise(() => {}));

    render(<LoginPage onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText("Work email"), "hr@company.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
  });

  it("re-enables the button after a failed login attempt", async () => {
    const user = userEvent.setup();

    mockedLogin.mockRejectedValue(new Error("Unauthorized"));

    render(<LoginPage onLogin={vi.fn()} />);

    await user.type(screen.getByLabelText("Work email"), "hr@company.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await screen.findByRole("alert");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    });
  });
});
