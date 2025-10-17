import axios from "axios";

import type {
  Booking,
  CreateBookingPayload,
  Owner,
  Pet,
  Suite,
  UpdateBookingPayload
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10_000
});

const getData = <T>(response: { data: T }) => response.data;

export const api = {
  // Suites
  listSuites: async (): Promise<Suite[]> => client.get<Suite[]>("/suites/").then(getData),
  createSuite: async (payload: Partial<Suite>): Promise<Suite> =>
    client.post<Suite>("/suites/", payload).then(getData),
  updateSuite: async (id: number, payload: Partial<Suite>): Promise<Suite> =>
    client.patch<Suite>(`/suites/${id}/`, payload).then(getData),
  deleteSuite: async (id: number): Promise<void> => {
    await client.delete(`/suites/${id}/`);
  },

  // Owners
  listOwners: async (): Promise<Owner[]> => client.get<Owner[]>("/owners/").then(getData),
  createOwner: async (payload: Partial<Owner>): Promise<Owner> =>
    client.post<Owner>("/owners/", payload).then(getData),
  updateOwner: async (id: number, payload: Partial<Owner>): Promise<Owner> =>
    client.patch<Owner>(`/owners/${id}/`, payload).then(getData),
  deleteOwner: async (id: number): Promise<void> => {
    await client.delete(`/owners/${id}/`);
  },

  // Pets
  listPets: async (): Promise<Pet[]> =>
    client.get<Pet[]>("/pets/").then(getData),
  createPet: async (payload: Partial<Pet> & { owner_id: number }): Promise<Pet> =>
    client.post<Pet>("/pets/", payload).then(getData),
  updatePet: async (id: number, payload: Partial<Pet>): Promise<Pet> =>
    client.patch<Pet>(`/pets/${id}/`, payload).then(getData),
  deletePet: async (id: number): Promise<void> => {
    await client.delete(`/pets/${id}/`);
  },

  // Bookings
  listBookings: async (): Promise<Booking[]> =>
    client.get<Booking[]>("/bookings/").then(getData),
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> =>
    client.post<Booking>("/bookings/", payload).then(getData),
  updateBooking: async (id: number, payload: UpdateBookingPayload): Promise<Booking> =>
    client.patch<Booking>(`/bookings/${id}/`, payload).then(getData),
  deleteBooking: async (id: number): Promise<void> => {
    await client.delete(`/bookings/${id}/`);
  },
  getCurrentBookings: async (): Promise<Booking[]> =>
    client.get<Booking[]>("/bookings/current/").then(getData)
};

export type ApiClient = typeof api;

