import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { BookingProvider, useBookingContext } from "../BookingContext";
import { ToastProvider } from "../../ToastContext";

vi.mock("@/api/client", () => ({
  api: {
    listSuites: vi.fn().mockResolvedValue([
      { id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }
    ]),
    listOwners: vi.fn().mockResolvedValue([
      { id: 1, name: "Jane Doe", phone: "", email: "", created_at: "", updated_at: "" }
    ]),
    listPets: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: "Buddy",
        breed: "",
        weight_kg: null,
        special_needs: [],
        owner: {
          id: 1,
          name: "Jane Doe",
          phone: "",
          email: "",
          created_at: "",
          updated_at: ""
        },
        created_at: "",
        updated_at: ""
      }
    ]),
    listBookings: vi.fn().mockResolvedValue([
      {
        id: 1,
        pet: {
          id: 1,
          name: "Buddy",
          breed: "",
          weight_kg: null,
          special_needs: [],
          owner: {
            id: 1,
            name: "Jane Doe",
            phone: "",
            email: "",
            created_at: "",
            updated_at: ""
          },
          created_at: "",
          updated_at: ""
        },
        suite: { id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" },
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        status: "booked",
        bathed: false,
        notes: "",
        created_at: "",
        updated_at: ""
      }
    ]),
    getCurrentBookings: vi.fn().mockResolvedValue([]),
    createBooking: vi.fn(),
    updateBooking: vi.fn(),
    deleteBooking: vi.fn(),
    createOwner: vi.fn(),
    createPet: vi.fn()
  }
}));

const Consumer = () => {
  const { suites, bookings, loading } = useBookingContext();
  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "ready"}</div>
      <div data-testid="suites">{suites.length}</div>
      <div data-testid="bookings">{bookings.length}</div>
    </div>
  );
};

const renderWithProvider = (children: ReactNode) =>
  render(
    <ToastProvider>
      <BookingProvider>{children}</BookingProvider>
    </ToastProvider>
  );

describe("BookingContext", () => {
  it("loads data on mount", async () => {
    renderWithProvider(<Consumer />);

    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
      expect(Number(screen.getByTestId("suites").textContent)).toBe(1);
      expect(Number(screen.getByTestId("bookings").textContent)).toBe(1);
    });
  });
});
