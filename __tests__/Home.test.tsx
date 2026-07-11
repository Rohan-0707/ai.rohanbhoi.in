import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: () => undefined,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("Landing page", () => {
  it("renders the main hero heading", async () => {
    const page = await LandingPage();
    render(page);

    expect(
      screen.getByRole("heading", {
        name: /Your Family's Monsoon Safety/i,
      }),
    ).toBeInTheDocument();
  });
});
