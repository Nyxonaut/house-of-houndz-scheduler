import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { BookingProvider, useBookingContext } from "../BookingContext";
import { ToastProvider } from "../ToastContext";
import { ToastViewport } from "../../components/common/ToastViewport";
import { api } from "@/api/client";

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
        status: "booked" as const,
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

const mockedApi = api as unknown as {
  createBooking: Mock;
};

afterEach(() => {
  mockedApi.createBooking.mockReset();
});

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

  it("shows a success toast when booking creation succeeds", async () => {
    const user = userEvent.setup();
    mockedApi.createBooking.mockResolvedValue({});

    const Trigger = () => {
      const { createBooking } = useBookingContext();
      return (
        <button
          type="button"
          onClick={() =>
            createBooking({
              pet_id: 1,
              suite_id: 1,
              start_date: "2024-01-10",
              end_date: "2024-01-12"
            })
          }
        >
          Create Success
        </button>
      );
    };

    renderWithProvider(
      <>
        <Consumer />
        <Trigger />
        <ToastViewport />
      </>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready")
    );
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Create Success/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/Booking created/i)).toBeInTheDocument()
    );
  });

  it("shows an error toast when booking creation fails", async () => {
    const user = userEvent.setup();
    mockedApi.createBooking.mockRejectedValueOnce(new Error("boom"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const Trigger = () => {
      const { createBooking } = useBookingContext();
      return (
        <button
          type="button"
          onClick={() =>
            createBooking({
              pet_id: 1,
              suite_id: 1,
              start_date: "2024-01-10",
              end_date: "2024-01-12"
            }).catch(() => null)
          }
        >
          Create Failure
        </button>
      );
    };

    renderWithProvider(
      <>
        <Consumer />
        <Trigger />
        <ToastViewport />
      </>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("ready")
    );
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Create Failure/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/Booking failed/i)).toBeInTheDocument()
    );

    consoleErrorSpy.mockRestore();
  });
});
