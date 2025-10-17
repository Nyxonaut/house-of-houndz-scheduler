import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from "react";
import type { ReactNode } from "react";

import { api } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import type {
  Booking,
  CreateBookingPayload,
  Owner,
  Pet,
  Suite,
  UpdateBookingPayload
} from "@/types";

interface BookingState {
  suites: Suite[];
  owners: Owner[];
  pets: Pet[];
  bookings: Booking[];
  current: Booking[];
  loading: boolean;
  error?: string;
  lastSynced?: string;
}

type BookingAction =
  | { type: "SET_DATA"; payload: Partial<BookingState> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload?: string };

const initialState: BookingState = {
  suites: [],
  owners: [],
  pets: [],
  bookings: [],
  current: [],
  loading: false
};

const reducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_DATA":
      return {
        ...state,
        ...action.payload,
        lastSynced: new Date().toISOString(),
        error: action.payload.error ?? state.error
      };
    default:
      return state;
  }
};

export interface BookingContextValue extends BookingState {
  refreshAll: (options?: { silenceErrors?: boolean }) => Promise<void>;
  createOwner: (payload: Partial<Owner>) => Promise<Owner>;
  createPet: (payload: Partial<Pet> & { owner_id: number }) => Promise<Pet>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  updateBooking: (id: number, payload: UpdateBookingPayload) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  toggleBathed: (id: number, bathed: boolean) => Promise<void>;
  checkInBooking: (id: number) => Promise<void>;
  checkOutBooking: (id: number) => Promise<void>;
}

export const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const POLL_INTERVAL = Number(import.meta.env.VITE_BOOKING_POLL_MS ?? 30_000);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toast = useToast();

  const loadAll = useCallback(async (silenceErrors = false) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [suites, owners, pets, bookings, current] = await Promise.all([
        api.listSuites(),
        api.listOwners(),
        api.listPets(),
        api.listBookings(),
        api.getCurrentBookings()
      ]);
      dispatch({
        type: "SET_DATA",
        payload: { suites, owners, pets, bookings, current, error: undefined }
      });
    } catch (error) {
      console.error("Failed to load booking data", error);
      if (!silenceErrors) {
        dispatch({
          type: "SET_ERROR",
          payload: "Unable to load booking data. Check API connectivity."
        });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const refreshAll = useCallback(
    async (options?: { silenceErrors?: boolean }) => loadAll(options?.silenceErrors),
    [loadAll]
  );

  const createOwner = useCallback(
    async (payload: Partial<Owner>) => {
      try {
        const owner = await api.createOwner(payload);
        toast.showToast({
          title: "Owner saved",
          variant: "success"
        });
        await refreshAll({ silenceErrors: true });
        return owner;
      } catch (error) {
        console.error("Failed to create owner", error);
        toast.showToast({
          title: "Owner creation failed",
          variant: "error"
        });
        throw error;
      }
    },
    [refreshAll, toast]
  );

  const createPet = useCallback(
    async (payload: Partial<Pet> & { owner_id: number }) => {
      try {
        const pet = await api.createPet(payload);
        toast.showToast({
          title: "Pet saved",
          variant: "success"
        });
        await refreshAll({ silenceErrors: true });
        return pet;
      } catch (error) {
        console.error("Failed to create pet", error);
        toast.showToast({
          title: "Pet creation failed",
          variant: "error"
        });
        throw error;
      }
    },
    [refreshAll, toast]
  );

  const createBooking = useCallback(
    async (payload: CreateBookingPayload) => {
      try {
        await api.createBooking(payload);
        toast.showToast({
          title: "Booking created",
          description: "The new booking was saved successfully.",
          variant: "success"
        });
      } catch (error) {
        console.error("Failed to create booking", error);
        toast.showToast({
          title: "Booking failed",
          description: "Unable to create booking. Check the details and try again.",
          variant: "error"
        });
        throw error;
      } finally {
        await refreshAll({ silenceErrors: true });
      }
    },
    [refreshAll, toast]
  );

  const updateBooking = useCallback(
    async (id: number, payload: UpdateBookingPayload) => {
      try {
        await api.updateBooking(id, payload);
        toast.showToast({
          title: "Booking updated",
          variant: "success"
        });
      } catch (error) {
        console.error("Failed to update booking", error);
        toast.showToast({
          title: "Update failed",
          description: "Changes could not be saved.",
          variant: "error"
        });
        throw error;
      } finally {
        await refreshAll({ silenceErrors: true });
      }
    },
    [refreshAll, toast]
  );

  const deleteBooking = useCallback(
    async (id: number) => {
      try {
        await api.deleteBooking(id);
        toast.showToast({
          title: "Booking removed",
          variant: "info"
        });
      } catch (error) {
        console.error("Failed to delete booking", error);
        toast.showToast({
          title: "Removal failed",
          variant: "error"
        });
        throw error;
      } finally {
        await refreshAll({ silenceErrors: true });
      }
    },
    [refreshAll, toast]
  );

  const toggleBathed = useCallback(
    async (id: number, bathed: boolean) => {
      try {
        await api.updateBooking(id, { bathed });
        toast.showToast({
          title: bathed ? "Marked as bathed" : "Bath status cleared",
          variant: "success"
        });
      } catch (error) {
        console.error("Failed to toggle bathed flag", error);
        toast.showToast({
          title: "Update failed",
          description: "Unable to update bathed flag.",
          variant: "error"
        });
        throw error;
      } finally {
        await refreshAll({ silenceErrors: true });
      }
    },
    [refreshAll, toast]
  );

  const checkInBooking = useCallback(
    async (id: number) => {
      await updateBooking(id, { status: "checked-in" });
    },
    [updateBooking]
  );

  const checkOutBooking = useCallback(
    async (id: number) => {
      await updateBooking(id, { status: "checked-out" });
    },
    [updateBooking]
  );

  useEffect(() => {
    loadAll();

    if (Number.isFinite(POLL_INTERVAL) && POLL_INTERVAL > 0) {
      const interval = window.setInterval(() => loadAll(true), POLL_INTERVAL);
      return () => window.clearInterval(interval);
    }

    return undefined;
  }, [loadAll]);

  const value = useMemo<BookingContextValue>(
    () => ({
      ...state,
      refreshAll,
      createOwner,
      createPet,
      createBooking,
      updateBooking,
      deleteBooking,
      toggleBathed,
      checkInBooking,
      checkOutBooking
    }),
    [
      state,
      refreshAll,
      createOwner,
      createPet,
      createBooking,
      updateBooking,
      deleteBooking,
      toggleBathed,
      checkInBooking,
      checkOutBooking
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBookingContext = (): BookingContextValue => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
};
