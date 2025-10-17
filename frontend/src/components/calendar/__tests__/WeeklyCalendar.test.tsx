import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WeeklyCalendar } from "../WeeklyCalendar";

const suite = { id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" };
const booking = {
  id: 1,
  pet: {
    id: 1,
    name: "Milo",
    breed: "Beagle",
    weight_kg: 12,
    special_needs: [],
    owner: {
      id: 1,
      name: "Alex",
      phone: "",
      email: "",
      created_at: "",
      updated_at: ""
    },
    created_at: "",
    updated_at: ""
  },
  suite,
  start_date: "2024-01-02",
  end_date: "2024-01-04",
  status: "booked" as const,
  bathed: false,
  notes: "",
  created_at: "",
  updated_at: ""
};

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("WeeklyCalendar", () => {
  it("renders bookings and vacant cells", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-03T12:00:00Z"));

    render(<WeeklyCalendar suites={[suite]} bookings={[booking]} />);

    expect(screen.getAllByTestId("calendar-booking").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("calendar-vacant").length).toBeGreaterThan(0);
  });

  it("navigates between weeks", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-03T12:00:00Z"));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<WeeklyCalendar suites={[]} bookings={[]} />);

    const range = screen.getByTestId("calendar-range");
    const initialRange = range.textContent;

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Next/i }));
    });
    expect(range.textContent).not.toEqual(initialRange);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Previous/i }));
    });
    expect(range.textContent).toEqual(initialRange);
  });
});
