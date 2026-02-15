# Testing Guide

This project uses **Vitest** and **React Testing Library** for testing.

## Running Tests

```bash
pnpm test              # Run tests in watch mode
pnpm test:run          # Run tests once
pnpm test:ui           # Run tests with Vitest UI
pnpm test:coverage     # Run tests with coverage report
```

## Test File Conventions

- Place test files next to the component they test (e.g., `Navbar.test.tsx`)
- Or create a `__tests__` directory in any folder
- Test files should match: `**/*.{test,spec}.{ts,tsx}`

## Example Test Structure

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

## Common Testing Library Queries

- `getByText()` - Find element by text content
- `getByRole()` - Find by ARIA role (preferred for accessibility)
- `getByLabelText()` - Find form elements by label
- `getByPlaceholderText()` - Find input by placeholder
- `getByAltText()` - Find images by alt text
- `queryBy*()` - Same as `getBy*` but returns null instead of throwing
- `findBy*()` - Async version that waits for element

## Mocking Next.js Components

For Next.js specific components like `Image`, `Link`, you may need to mock them:

```tsx
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
```

## Tips

- Test behavior, not implementation
- Use semantic queries (role, label, text) over test IDs
- Keep tests simple and focused on one thing
- Use `screen.debug()` to see the current DOM state
- Prefer `userEvent` over `fireEvent` for realistic interactions
