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

interface BookingContextValue extends BookingState {
  refreshAll: (options?: { silenceErrors?: boolean }) => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<void>;
  updateBooking: (id: number, payload: UpdateBookingPayload) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
  toggleBathed: (id: number, bathed: boolean) => Promise<void>;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const POLL_INTERVAL = Number(import.meta.env.VITE_BOOKING_POLL_MS ?? 30_000);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const createBooking = useCallback(
    async (payload: CreateBookingPayload) => {
      await api.createBooking(payload);
      await refreshAll({ silenceErrors: true });
    },
    [refreshAll]
  );

  const updateBooking = useCallback(
    async (id: number, payload: UpdateBookingPayload) => {
      await api.updateBooking(id, payload);
      await refreshAll({ silenceErrors: true });
    },
    [refreshAll]
  );

  const deleteBooking = useCallback(
    async (id: number) => {
      await api.deleteBooking(id);
      await refreshAll({ silenceErrors: true });
    },
    [refreshAll]
  );

  const toggleBathed = useCallback(
    async (id: number, bathed: boolean) => {
      await api.updateBooking(id, { bathed });
      await refreshAll({ silenceErrors: true });
    },
    [refreshAll]
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
      createBooking,
      updateBooking,
      deleteBooking,
      toggleBathed
    }),
    [state, refreshAll, createBooking, updateBooking, deleteBooking, toggleBathed]
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
