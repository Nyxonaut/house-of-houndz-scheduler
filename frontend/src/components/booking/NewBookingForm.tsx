import { FormEvent, useMemo, useState } from "react";

import { useBookingContext } from "@/context/BookingContext";
import type { Booking, Owner, Pet, Suite } from "@/types";
import { formatDisplayDate } from "@/utils/date";
import { Alert } from "@/components/common/Alert";
import { Spinner } from "@/components/common/Spinner";

type OwnerMode = "existing" | "new";
type PetMode = "existing" | "new";

const defaultOwnerForm = {
  name: "",
  phone: "",
  email: ""
};

const defaultPetForm = {
  name: "",
  breed: "",
  weight_kg: "",
  special_needs: ""
};

interface FormState {
  ownerMode: OwnerMode;
  petMode: PetMode;
  ownerId?: number;
  petId?: number;
  suiteId?: number;
  startDate: string;
  endDate: string;
  bathed: boolean;
  notes: string;
  ownerForm: typeof defaultOwnerForm;
  petForm: typeof defaultPetForm;
}

const filterBookingsForSuite = (bookings: Booking[], suiteId: number) =>
  bookings.filter(
    (booking) =>
      booking.suite.id === suiteId && ["booked", "checked-in"].includes(booking.status)
  );

const hasConflict = (bookings: Booking[], suiteId: number, start: string, end: string) => {
  if (!suiteId || !start || !end) return false;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return filterBookingsForSuite(bookings, suiteId).some((booking) => {
    const bookingStart = new Date(booking.start_date);
    const bookingEnd = new Date(booking.end_date);
    return bookingStart <= endDate && bookingEnd >= startDate;
  });
};

export const NewBookingForm = () => {
  const {
    owners,
    pets,
    suites,
    bookings,
    createOwner,
    createPet,
    createBooking
  } = useBookingContext();

  const [formState, setFormState] = useState<FormState>({
    ownerMode: owners.length ? "existing" : "new",
    petMode: pets.length ? "existing" : "new",
    ownerId: owners[0]?.id,
    petId: pets[0]?.id,
    suiteId: suites[0]?.id,
    startDate: "",
    endDate: "",
    bathed: false,
    notes: "",
    ownerForm: defaultOwnerForm,
    petForm: defaultPetForm
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const filteredPets = useMemo(() => {
    if (!formState.ownerId) return pets;
    return pets.filter((pet) => pet.owner.id === formState.ownerId);
  }, [pets, formState.ownerId]);

  const suiteConflict = hasConflict(
    bookings,
    formState.suiteId ?? 0,
    formState.startDate,
    formState.endDate
  );

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetForm = () => {
    setFormState({
      ownerMode: owners.length ? "existing" : "new",
      petMode: pets.length ? "existing" : "new",
      ownerId: owners[0]?.id,
      petId: pets[0]?.id,
      suiteId: suites[0]?.id,
      startDate: "",
      endDate: "",
      bathed: false,
      notes: "",
      ownerForm: defaultOwnerForm,
      petForm: defaultPetForm
    });
    setError(undefined);
  };

  const validate = () => {
    if (!formState.startDate || !formState.endDate) {
      return "Start and end dates are required.";
    }
    if (new Date(formState.startDate) > new Date(formState.endDate)) {
      return "End date must be after the start date.";
    }
    if (!formState.suiteId) {
      return "Select a suite for the booking.";
    }
    if (suiteConflict) {
      return "Selected suite is already booked for those dates.";
    }
    if (formState.ownerMode === "existing" && !formState.ownerId) {
      return "Select an owner.";
    }
    if (formState.ownerMode === "new" && !formState.ownerForm.name.trim()) {
      return "Owner name is required.";
    }
    if (formState.petMode === "existing" && !formState.petId) {
      return "Select a pet.";
    }
    if (formState.petMode === "new" && !formState.petForm.name.trim()) {
      return "Pet name is required.";
    }
    return undefined;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    try {
      let ownerId = formState.ownerId;
      if (formState.ownerMode === "new") {
        const owner = await createOwner(formState.ownerForm);
        ownerId = owner.id;
      }

      let petId = formState.petId;
      if (formState.petMode === "new") {
        if (!ownerId) {
          throw new Error("Owner must be determined before creating a pet.");
        }
        const payload = {
          owner_id: ownerId,
          name: formState.petForm.name.trim(),
          breed: formState.petForm.breed,
          weight_kg: formState.petForm.weight_kg
            ? Number(formState.petForm.weight_kg)
            : null,
          special_needs: formState.petForm.special_needs
            ? formState.petForm.special_needs
                .split(/[\n,]+/)
                .map((item) => item.trim())
                .filter(Boolean)
            : []
        };
        const pet = await createPet(payload);
        petId = pet.id;
      }

      if (!ownerId || !petId || !formState.suiteId) {
        throw new Error("Missing booking data.");
      }

      await createBooking({
        pet_id: petId,
        suite_id: formState.suiteId,
        start_date: formState.startDate,
        end_date: formState.endDate,
        status: "booked",
        bathed: formState.bathed,
        notes: formState.notes
      });

      resetForm();
    } catch (submissionError) {
      console.error(submissionError);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!suites.length) {
    return (
      <Alert variant="warning">
        Create suites in the backend before adding new bookings. No suites are available yet.
      </Alert>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-slate-900/60 p-4 shadow">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Owner</h2>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${formState.ownerMode === "existing" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"}`}
                onClick={() => handleChange("ownerMode", "existing")}
              >
                Existing
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${formState.ownerMode === "new" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"}`}
                onClick={() => handleChange("ownerMode", "new")}
              >
                New
              </button>
            </div>
          </header>

          {formState.ownerMode === "existing" ? (
            <label className="block text-sm text-slate-200">
              Select owner
              <select
                className="mt-2 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                value={formState.ownerId ?? ""}
                onChange={(event) =>
                  handleChange("ownerId", Number(event.target.value) || undefined)
                }
              >
                <option value="">Choose owner...</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.phone || "No phone"})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="space-y-3 text-sm">
              <label className="block text-slate-200">
                Name
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  value={formState.ownerForm.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ownerForm: { ...prev.ownerForm, name: event.target.value }
                    }))
                  }
                  required
                />
              </label>
              <label className="block text-slate-200">
                Phone
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  value={formState.ownerForm.phone}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ownerForm: { ...prev.ownerForm, phone: event.target.value }
                    }))
                  }
                />
              </label>
              <label className="block text-slate-200">
                Email
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  type="email"
                  value={formState.ownerForm.email}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      ownerForm: { ...prev.ownerForm, email: event.target.value }
                    }))
                  }
                />
              </label>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-slate-900/60 p-4 shadow">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pet</h2>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${formState.petMode === "existing" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"}`}
                onClick={() => handleChange("petMode", "existing")}
              >
                Existing
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${formState.petMode === "new" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"}`}
                onClick={() => handleChange("petMode", "new")}
              >
                New
              </button>
            </div>
          </header>

          {formState.petMode === "existing" ? (
            <label className="block text-sm text-slate-200">
              Select pet
              <select
                className="mt-2 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                value={formState.petId ?? ""}
                onChange={(event) =>
                  handleChange("petId", Number(event.target.value) || undefined)
                }
              >
                <option value="">Choose pet...</option>
                {filteredPets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.owner.name})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="space-y-3 text-sm">
              <label className="block text-slate-200">
                Name
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  value={formState.petForm.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      petForm: { ...prev.petForm, name: event.target.value }
                    }))
                  }
                  required
                />
              </label>
              <label className="block text-slate-200">
                Breed
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  value={formState.petForm.breed}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      petForm: { ...prev.petForm, breed: event.target.value }
                    }))
                  }
                />
              </label>
              <label className="block text-slate-200">
                Weight (kg)
                <input
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formState.petForm.weight_kg}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      petForm: { ...prev.petForm, weight_kg: event.target.value }
                    }))
                  }
                />
              </label>
              <label className="block text-slate-200">
                Special needs (comma or newline separated)
                <textarea
                  className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
                  rows={3}
                  value={formState.petForm.special_needs}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      petForm: { ...prev.petForm, special_needs: event.target.value }
                    }))
                  }
                />
              </label>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg bg-slate-900/60 p-4 shadow text-sm text-slate-100">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            Suite
            <select
              className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
              value={formState.suiteId ?? ""}
              onChange={(event) =>
                handleChange("suiteId", Number(event.target.value) || undefined)
              }
            >
              <option value="">Choose suite...</option>
              {suites.map((suite: Suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Start date
            <input
              type="date"
              className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
              value={formState.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
            />
          </label>
          <label className="block">
            End date
            <input
              type="date"
              className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
              value={formState.endDate}
              onChange={(event) => handleChange("endDate", event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 pt-5 text-xs uppercase tracking-wide text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-400"
              checked={formState.bathed}
              onChange={(event) => handleChange("bathed", event.target.checked)}
            />
            Bathed before departure
          </label>
        </div>

        <label className="mt-4 block">
          Notes
          <textarea
            className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-white"
            rows={3}
            value={formState.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            placeholder="Feeding schedule, medication, special instructions…"
          />
        </label>

        {suiteConflict ? (
          <Alert variant="danger">
            <p className="text-sm font-medium">Possible conflict</p>
            <p className="mt-1 text-xs text-slate-200/80">
              Suite already has a booking within these dates. Double-check the schedule before
              submitting.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {filterBookingsForSuite(bookings, formState.suiteId ?? 0).map((booking) => (
                <li key={booking.id} className="rounded-md bg-slate-800 px-2 py-1">
                  {booking.pet.name} · {formatDisplayDate(booking.start_date)} →{" "}
                  {formatDisplayDate(booking.end_date)} ({booking.status})
                </li>
              ))}
            </ul>
          </Alert>
        ) : null}
      </section>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="flex flex-col items-start gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Spinner label="Submitting..." inline />
            </>
          ) : (
            "Create booking"
          )}
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          onClick={resetForm}
        >
          Reset form
        </button>
      </div>
    </form>
  );
};
