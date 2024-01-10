import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Website from "../src/screens/Website";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      replace: () => null,
    };
  },
  usePathname() {
    return "";
  },
}));

describe("Website", () => {
  it("heading content is 'A web annotation built on top of Farcaster'", () => {
    render(<Website />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading.textContent).toEqual(
      `A web annotation built on top of Farcaster`
    );
  });
});
