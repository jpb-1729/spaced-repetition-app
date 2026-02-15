import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
}));

import { auth } from "@/auth";

const mockedAuth = vi.mocked(auth);

describe("Home page", () => {
  it("shows login and signup buttons when not logged in", async () => {
    mockedAuth.mockResolvedValue(null as any);

    const { default: Home } = await import("@/app/page");
    render(await Home());

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("hides login and signup buttons when logged in", async () => {
    mockedAuth.mockResolvedValue({
      user: { name: "Test User", email: "test@example.com" },
      expires: "2099-01-01",
    } as any);

    const { default: Home } = await import("@/app/page");
    render(await Home());

    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign up/i })).not.toBeInTheDocument();
  });

  it("renders the welcome heading and description", async () => {
    mockedAuth.mockResolvedValue(null as any);

    const { default: Home } = await import("@/app/page");
    render(await Home());

    expect(screen.getByText("Welcome to Olivero Recall")).toBeInTheDocument();
    expect(screen.getByText(/learn smarter, not harder/i)).toBeInTheDocument();
  });
});
