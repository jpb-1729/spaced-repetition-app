import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/auth", () => ({
  signOut: vi.fn(),
}));

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/hooks/use-theme";

function renderNavbar(props?: React.ComponentProps<typeof Navbar>) {
  return render(
    <ThemeProvider>
      <Navbar {...props} />
    </ThemeProvider>
  );
}

describe("Navbar", () => {
  it("renders the logo", () => {
    renderNavbar();

    const logo = screen.getByAltText("Spaced Repetition Logo");
    expect(logo).toBeInTheDocument();
  });

  it("hides navigation links when user is not logged in", () => {
    renderNavbar();

    expect(screen.queryByText("Study")).not.toBeInTheDocument();
    expect(screen.queryByText("Stats")).not.toBeInTheDocument();
    expect(screen.queryByText("Decks")).not.toBeInTheDocument();
  });

  it("shows navigation links when user is logged in", () => {
    const user = { name: "Test User", image: "/test.jpg" };
    renderNavbar({ user });

    expect(screen.getByText("Study")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Decks")).toBeInTheDocument();
  });

  it("renders correct navigation links with proper hrefs", () => {
    const user = { name: "Test User", image: "/test.jpg" };
    renderNavbar({ user });

    const studyLink = screen.getByRole("link", { name: /study/i });
    const statsLink = screen.getByRole("link", { name: /stats/i });
    const decksLink = screen.getByRole("link", { name: /decks/i });

    expect(studyLink).toHaveAttribute("href", "/view_decks");
    expect(statsLink).toHaveAttribute("href", "/stats");
    expect(decksLink).toHaveAttribute("href", "/decks");
  });
});
