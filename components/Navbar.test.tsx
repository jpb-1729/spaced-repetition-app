import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders the logo", () => {
    render(<Navbar />);

    const logo = screen.getByAltText("Spaced Repetition Logo");
    expect(logo).toBeInTheDocument();
  });

  it("hides navigation links when user is not logged in", () => {
    render(<Navbar />);

    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.queryByText("Study")).not.toBeInTheDocument();
    expect(screen.queryByText("Stats")).not.toBeInTheDocument();
    expect(screen.queryByText("Decks")).not.toBeInTheDocument();
  });

  it("shows navigation links when user is logged in", () => {
    const user = { name: "Test User", image: "/test.jpg" };
    render(<Navbar user={user} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Study")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Decks")).toBeInTheDocument();
  });

  it("renders correct navigation links with proper hrefs", () => {
    const user = { name: "Test User", image: "/test.jpg" };
    render(<Navbar user={user} />);

    const homeLink = screen.getByRole("link", { name: /home/i });
    const studyLink = screen.getByRole("link", { name: /study/i });
    const statsLink = screen.getByRole("link", { name: /stats/i });
    const decksLink = screen.getByRole("link", { name: /decks/i });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(studyLink).toHaveAttribute("href", "/view_decks");
    expect(statsLink).toHaveAttribute("href", "/stats");
    expect(decksLink).toHaveAttribute("href", "/decks");
  });
});
