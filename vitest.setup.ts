import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia — needed by the theme hook's
// prefers-color-scheme detection.
window.matchMedia =
  window.matchMedia ||
  function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
