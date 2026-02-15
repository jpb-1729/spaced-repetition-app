import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
}));

import SignIn from "@/components/SignIn";

describe("SignIn component", () => {
  it("renders the Continue with Google button", () => {
    render(<SignIn />);

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it("renders the Google icon", () => {
    const { container } = render(<SignIn />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
