import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WeeklyCalendar } from "../WeeklyCalendar";

afterEach(() => {
  vi.clearAllMocks();
});

describe("WeeklyCalendar", () => {
  it("renders bookings on the grid", () => {
    render(
      <WeeklyCalendar
        suites={[{ id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }]}
        bookings={[
          {
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
            suite: { id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" },
            start_date: "2020-01-02",
            end_date: "2030-01-05",
            status: "booked",
            bathed: false,
            notes: "",
            created_at: "",
            updated_at: ""
          }
        ]}
      />
    );

    expect(screen.getAllByText("Milo").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Booked/i).length).toBeGreaterThan(0);
  });

  it("navigates between weeks", async () => {
    render(
      <WeeklyCalendar suites={[]} bookings={[]} />
    );

    const range = screen.getByTestId("calendar-range");
    const initialRange = range.textContent;

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Next/i }));
    });
    expect(range.textContent).not.toEqual(initialRange);

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Previous/i }));
    });
    expect(range.textContent).toEqual(initialRange);
  });
});
