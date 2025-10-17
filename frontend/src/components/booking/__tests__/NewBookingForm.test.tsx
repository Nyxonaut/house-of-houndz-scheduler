import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BookingContext } from "@/context/BookingContext";
import type { BookingContextValue } from "@/context/BookingContext";
import { ToastProvider } from "@/context/ToastContext";
import { NewBookingForm } from "../NewBookingForm";

const renderWithContext = (ctx: Partial<BookingContextValue>) => {
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

  return render(
    <ToastProvider>
      <BookingContext.Provider value={value}>
        <NewBookingForm />
      </BookingContext.Provider>
    </ToastProvider>
  );
};

describe("NewBookingForm", () => {
  it("creates new owner, pet, and booking on submit", async () => {
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

    renderWithContext({
      suites: [{ id: 1, label: "Suite 1", notes: "", created_at: "", updated_at: "" }],
      createOwner,
      createPet,
      createBooking
    });

    await userEvent.type(screen.getByLabelText(/Name/i), "Alex");
    const phoneInput = screen.getByLabelText(/Phone/i);
    await userEvent.type(phoneInput, "555-0100");

    const petNameInput = screen.getAllByLabelText(/Name/i)[1];
    await userEvent.type(petNameInput, "Milo");
    await userEvent.type(screen.getByLabelText(/Breed/i), "Beagle");
    await userEvent.type(screen.getByLabelText(/Weight/i), "12");

    fireEvent.change(screen.getByLabelText(/^Suite$/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: "2024-01-01" } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: "2024-01-05" } });

    const submitButton = screen.getByRole("button", { name: /Create booking/i });
    await userEvent.click(submitButton);

    expect(createOwner).toHaveBeenCalledWith({
      name: "Alex",
      phone: "555-0100",
      email: ""
    });
    expect(createPet).toHaveBeenCalledWith({
      owner_id: 1,
      name: "Milo",
      breed: "Beagle",
      weight_kg: 12,
      special_needs: []
    });
    expect(createBooking).toHaveBeenCalledWith({
      pet_id: 1,
      suite_id: 1,
      start_date: "2024-01-01",
      end_date: "2024-01-05",
      status: "booked",
      bathed: false,
      notes: ""
    });
  });

  it("warns when selected suite has conflicting booking", () => {
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
        status: "booked",
        bathed: false,
        notes: "",
        created_at: "",
        updated_at: ""
      }
    ];

    renderWithContext({
      owners,
      pets,
      suites,
      bookings
    });

    // switch to existing modes
    await userEvent.click(screen.getByRole("button", { name: /Existing/i }));
    const petExistingButton = screen.getAllByRole("button", { name: /Existing/i })[1];
    await userEvent.click(petExistingButton);

    fireEvent.change(screen.getByLabelText(/^Suite$/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: "2024-01-02" } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: "2024-01-03" } });

    expect(
      screen.getByText(/Selected suite is already booked for those dates/i)
    ).toBeInTheDocument();
  });
});
