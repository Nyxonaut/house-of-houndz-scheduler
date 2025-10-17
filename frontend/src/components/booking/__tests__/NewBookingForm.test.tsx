import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BookingContext } from "@/context/BookingContext";
import type { BookingContextValue } from "@/context/BookingContext";
import { ToastProvider } from "@/context/ToastContext";
import { NewBookingForm } from "../NewBookingForm";

const renderWithContext = async (ctx: Partial<BookingContextValue>) => {
  const baseContext: BookingContextValue = {
    suites: [],
    owners: [],
    pets: [],
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
    checkOutBooking: vi.fn()
  };

  const value = { ...baseContext, ...ctx };

  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(
      <ToastProvider>
        <BookingContext.Provider value={value}>
          <NewBookingForm />
        </BookingContext.Provider>
      </ToastProvider>
    );
  });
  return result!;
};

describe("NewBookingForm", () => {
  it("creates new owner, pet, and booking on submit", async () => {
    const user = userEvent.setup();
    const createOwner = vi.fn().mockResolvedValue({
      id: 1,
      name: "Alex",
      phone: "555-0100",
      email: "alex@example.com",
      created_at: "",
      updated_at: ""
    });
    const createPet = vi.fn().mockResolvedValue({
      id: 1,
      name: "Milo",
      breed: "Beagle",
      weight_kg: 12,
      special_needs: [],
      owner: {
        id: 1,
        name: "Alex",
        phone: "555-0100",
        email: "alex@example.com",
        created_at: "",
        updated_at: ""
      },
      created_at: "",
      updated_at: ""
    });
    const createBooking = vi.fn().mockResolvedValue({});

    await renderWithContext({
      suites: [{ id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }],
      createOwner,
      createPet,
      createBooking
    });

    const [ownerNameInput, petNameInput] = screen.getAllByLabelText(/Name/i);
    await act(async () => {
      await user.type(ownerNameInput, "Alex");
      await user.type(screen.getByLabelText(/Phone/i), "555-0100");

      await user.type(petNameInput, "Milo");
      await user.type(screen.getByLabelText(/Breed/i), "Beagle");
      await user.type(screen.getByLabelText(/Weight/i), "12");

      fireEvent.change(screen.getByLabelText(/^Suite$/i), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText(/Start date/i), {
        target: { value: "2024-01-01" }
      });
      fireEvent.change(screen.getByLabelText(/End date/i), {
        target: { value: "2024-01-05" }
      });

      await user.click(screen.getByRole("button", { name: /Create booking/i }));
    });

    await waitFor(() =>
      expect(createOwner).toHaveBeenCalledWith({
        name: "Alex",
        phone: "555-0100",
        email: ""
      })
    );
    await waitFor(() =>
      expect(createPet).toHaveBeenCalledWith({
        owner_id: 1,
        name: "Milo",
        breed: "Beagle",
        weight_kg: 12,
        special_needs: []
      })
    );
    await waitFor(() =>
      expect(createBooking).toHaveBeenCalledWith({
        pet_id: 1,
        suite_id: 1,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        status: "booked",
        bathed: false,
        notes: ""
      })
    );
  });

  it("warns when selected suite has conflicting booking", async () => {
    const owners = [
      { id: 1, name: "Alex", phone: "", email: "", created_at: "", updated_at: "" }
    ];
    const pets = [
      {
        id: 1,
        name: "Milo",
        breed: "",
        weight_kg: null,
        special_needs: [],
        owner: owners[0],
        created_at: "",
        updated_at: ""
      }
    ];
    const suites = [{ id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }];
    const bookings = [
      {
        id: 1,
        pet: pets[0],
        suite: suites[0],
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        status: "booked" as const,
        bathed: false,
        notes: "",
        created_at: "",
        updated_at: ""
      }
    ];

    await renderWithContext({
      owners,
      pets,
      suites,
      bookings
    });

    // switch to existing modes
    const [ownerExistingButton, petExistingButton] = screen.getAllByRole("button", {
      name: /Existing/i
    });
    const user = userEvent.setup();
    await act(async () => {
      await user.click(ownerExistingButton);
      await user.click(petExistingButton);

      fireEvent.change(screen.getByLabelText(/^Suite$/i), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText(/Start date/i), {
        target: { value: "2024-01-02" }
      });
      fireEvent.change(screen.getByLabelText(/End date/i), {
        target: { value: "2024-01-03" }
      });
    });

    expect(
      screen.getByText(/suite already has a booking within these dates/i)
    ).toBeInTheDocument();
  });
});
