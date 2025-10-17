import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BookingContext, type BookingContextValue } from "@/context/BookingContext";
import { ToastProvider } from "@/context/ToastContext";
import { DashboardPage } from "../DashboardPage";

const suites = [{ id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }];

const owner = {
  id: 1,
  name: "Alex",
  phone: "555-0100",
  email: "",
  created_at: "",
  updated_at: ""
};

const pet = {
  id: 1,
  name: "Milo",
  breed: "Beagle",
  weight_kg: 12,
  special_needs: [],
  owner,
  created_at: "",
  updated_at: ""
};

const createContextValue = (
  overrides: Partial<BookingContextValue>
): BookingContextValue => ({
  suites,
  owners: [owner],
  pets: [pet],
  bookings: [],
  current: [],
  loading: false,
  error: undefined,
  lastSynced: undefined,
  refreshAll: vi.fn(),
  createOwner: vi.fn(),
  createPet: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
  toggleBathed: vi.fn(),
  checkInBooking: vi.fn(),
  checkOutBooking: vi.fn(),
  ...overrides
});

const renderDashboard = (ctx: Partial<BookingContextValue>) =>
  render(
    <ToastProvider>
      <BookingContext.Provider value={createContextValue(ctx)}>
        <DashboardPage />
      </BookingContext.Provider>
    </ToastProvider>
  );

describe("DashboardPage", () => {
  it("allows checking in a booked guest", async () => {
    const checkInBooking = vi.fn();
    renderDashboard({
      bookings: [
        {
          id: 1,
          pet,
          suite: suites[0],
          start_date: "2020-01-01",
          end_date: "2030-01-05",
          status: "booked",
          bathed: false,
          notes: "",
          created_at: "",
          updated_at: ""
        }
      ],
      checkInBooking
    });

    const button = await screen.findByRole("button", { name: /Check In/i });
    await userEvent.click(button);
    expect(checkInBooking).toHaveBeenCalledWith(1);
  });

  it("filters to vacant suites", async () => {
    renderDashboard({
      bookings: [
        {
          id: 1,
          pet,
          suite: suites[0],
          start_date: "2020-01-01",
          end_date: "2030-01-05",
          status: "checked-in",
          bathed: false,
          notes: "",
          created_at: "",
          updated_at: ""
        }
      ]
    });

    await userEvent.click(screen.getByRole("button", { name: /Vacant/i }));
    expect(screen.getByText(/No suites match the selected filter/i)).toBeInTheDocument();
  });
});
