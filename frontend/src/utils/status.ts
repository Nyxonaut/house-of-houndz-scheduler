import type { BookingStatus } from "@/types";

export const statusLabels: Record<BookingStatus, string> = {
  booked: "Booked",
  "checked-in": "Checked In",
  "checked-out": "Checked Out"
};

export const statusColors: Record<BookingStatus, string> = {
  booked: "bg-amber-500",
  "checked-in": "bg-emerald-500",
  "checked-out": "bg-slate-400"
};

