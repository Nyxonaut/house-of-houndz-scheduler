export type BookingStatus = "booked" | "checked-in" | "checked-out";

export interface Suite {
  id: number;
  label: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: number;
  name: string;
  breed: string;
  weight_kg: number | null;
  special_needs: string[];
  owner: Owner;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  pet: Pet;
  suite: Suite;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  bathed: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingPayload {
  pet_id: number;
  suite_id: number;
  start_date: string;
  end_date: string;
  status?: BookingStatus;
  bathed?: boolean;
  notes?: string;
}

export interface UpdateBookingPayload extends Partial<CreateBookingPayload> {}

export interface ApiError {
  message: string;
  details?: Record<string, unknown>;
}

