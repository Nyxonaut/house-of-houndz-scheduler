import clsx from "clsx";
import { useMemo, useState } from "react";

import { Alert } from "@/components/common/Alert";
import { Skeleton } from "@/components/common/Skeleton";
import { Spinner } from "@/components/common/Spinner";
import { useBookingContext } from "@/context/BookingContext";
import type { Booking } from "@/types";
import { formatDisplayDate } from "@/utils/date";

type FilterMode = "all" | "checked-in" | "booked" | "vacant";

const statusPalette: Record<FilterMode, string> = {
  all: "bg-slate-800 text-white",
  "checked-in": "bg-emerald-600 text-white",
  booked: "bg-amber-500 text-slate-900",
  vacant: "bg-rose-600 text-white"
};

const determineState = (booking: Booking | undefined): FilterMode => {
  if (!booking) return "vacant";
  if (booking.status === "checked-in") return "checked-in";
  if (booking.status === "booked") return "booked";
  return "vacant";
};

const todayWithin = (booking: Booking) => {
  const today = new Date();
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  return start <= today && end >= today;
};

export const DashboardPage: React.FC = () => {
  const {
    suites,
    bookings,
    loading,
    refreshAll,
    toggleBathed,
    checkInBooking,
    checkOutBooking
  } = useBookingContext();
  const [filter, setFilter] = useState<FilterMode>("all");

  const occupancy = useMemo(() => {
    const bySuite = suites.map((suite) => {
      const active = bookings
        .filter(
          (booking) =>
            booking.suite.id === suite.id &&
            ["booked", "checked-in"].includes(booking.status) &&
            todayWithin(booking)
        )
        .sort((left, right) => {
          if (left.status === "checked-in" && right.status !== "checked-in") {
            return -1;
          }
          if (right.status === "checked-in" && left.status !== "checked-in") {
            return 1;
          }
          return 0;
        });
      const booking = active[0];
      return {
        suite,
        booking,
        state: determineState(booking)
      };
    });
    return bySuite;
  }, [bookings, suites]);

  const filtered = occupancy.filter((entry) => {
    if (filter === "all") return true;
    return entry.state === filter;
  });

  const stats = {
    totalSuites: suites.length,
    checkedIn: occupancy.filter((entry) => entry.state === "checked-in").length,
    booked: occupancy.filter((entry) => entry.state === "booked").length,
    vacant: occupancy.filter((entry) => entry.state === "vacant").length
  };

  const handleToggleBathed = async (bookingId: number, bathed: boolean) => {
    await toggleBathed(bookingId, bathed);
  };

  const handleCheckIn = async (bookingId: number) => {
    await checkInBooking(bookingId);
  };

  const handleCheckOut = async (bookingId: number) => {
    await checkOutBooking(bookingId);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Current Residents</h1>
          <p className="mt-1 text-sm text-slate-300">
            Monitor who is onsite, manage check-ins/check-outs, and track bathing status in real
            time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshAll()}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
          >
            Refresh
          </button>
          {loading ? <Spinner label="Syncing..." /> : null}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatPill label="Total Suites" value={stats.totalSuites} color="bg-slate-800" />
        <StatPill label="Checked-in" value={stats.checkedIn} color="bg-emerald-600" />
        <StatPill label="Booked" value={stats.booked} color="bg-amber-500 text-slate-900" />
        <StatPill label="Vacant" value={stats.vacant} color="bg-rose-600" />
      </div>

  <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">Quick filters:</span>
        {(["all", "checked-in", "booked", "vacant"] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilter(mode)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
              filter === mode
                ? `${statusPalette[mode]} text-white`
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
          >
            {mode.replace("-", " ")}
          </button>
        ))}
      </div>

      {loading && !occupancy.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {!filtered.length ? (
        <Alert variant="info">No suites match the selected filter.</Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map(({ suite, booking, state }) => (
          <article
            key={suite.id}
            className={clsx(
              "rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow transition hover:border-emerald-500/40",
              state === "checked-in" && "ring-1 ring-emerald-400/40",
              state === "booked" && "ring-1 ring-amber-400/40",
              state === "vacant" && "ring-1 ring-rose-400/30"
            )}
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{suite.label}</h2>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  statusPalette[state]
                )}
              >
                {state === "vacant" ? "Vacant" : state.replace("-", " ")}
              </span>
            </header>

            {booking ? (
              <div className="mt-3 space-y-3 text-sm text-slate-200">
                <div>
                  <p className="text-base font-semibold text-white">{booking.pet.name}</p>
                  <p className="text-xs text-slate-400">{booking.pet.breed || "Breed TBD"}</p>
                </div>
                <dl className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-400">Owner</dt>
                    <dd className="text-slate-200">
                      {booking.pet.owner.name}
                      <br />
                      <span className="text-slate-400">
                        {booking.pet.owner.phone || booking.pet.owner.email || "Contact TBD"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Stay</dt>
                    <dd>
                      {formatDisplayDate(booking.start_date)} → {formatDisplayDate(booking.end_date)}
                    </dd>
                  </div>
                </dl>

                {booking.pet.special_needs?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                      Special needs
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {booking.pet.special_needs.map((need, index) => (
                        <span
                          key={`${booking.id}-need-${index}`}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-amber-100"
                        >
                          ⚠️ {need}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={booking.bathed}
                      onChange={(event) => handleToggleBathed(booking.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-400"
                    />
                    Bathed
                  </label>
                  <div className="ml-auto flex gap-2">
                    {booking.status === "booked" ? (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(booking.id)}
                        className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400"
                      >
                        Check In
                      </button>
                    ) : null}
                    {booking.status === "checked-in" ? (
                      <button
                        type="button"
                        onClick={() => handleCheckOut(booking.id)}
                        className="rounded-md bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-400"
                      >
                        Check Out
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <Alert variant="danger">
                Suite is currently vacant. Booking requests will appear here automatically.
              </Alert>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const StatPill: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color
}) => (
  <div className={clsx("rounded-lg p-4 text-sm text-white shadow", color)}>
    <p className="uppercase tracking-wide text-xs">{label}</p>
    <p className="mt-1 text-3xl font-semibold">{value}</p>
  </div>
);
