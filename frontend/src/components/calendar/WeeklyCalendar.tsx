import clsx from "clsx";
import { useMemo, useState } from "react";

import type { Booking, Suite } from "@/types";
import { formatDisplayDate, getWeekDates, toDate } from "@/utils/date";
import { statusColors, statusLabels } from "@/utils/status";

interface WeeklyCalendarProps {
  suites: Suite[];
  bookings: Booking[];
}

const startOfWeek = (anchor: Date) => {
  const date = new Date(anchor);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ suites, bookings }) => {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const week = useMemo(() => getWeekDates(anchor), [anchor]);
  const today = new Date();

  const bookingLookup = useMemo(() => {
    const map = new Map<number, Booking[]>();
    bookings.forEach((booking) => {
      const list = map.get(booking.suite.id) ?? [];
      list.push(booking);
      map.set(booking.suite.id, list);
    });
    return map;
  }, [bookings]);

  const getBookingsForCell = (suiteId: number, date: Date) => {
    const items = bookingLookup.get(suiteId) ?? [];
    return items.filter((booking) => {
      const start = toDate(booking.start_date);
      const end = toDate(booking.end_date);
      return start <= date && end >= date;
    });
  };

  const advanceWeek = (offset: number) => {
    setAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset * 7);
      return startOfWeek(next);
    });
  };

  const goToToday = () => setAnchor(startOfWeek(new Date()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Weekly Calendar</h2>
          <p
            className="text-xs uppercase tracking-wide text-slate-400"
            data-testid="calendar-range"
          >
            {formatDisplayDate(week[0])} – {formatDisplayDate(week[week.length - 1])}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            onClick={() => advanceWeek(-1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            onClick={() => goToToday()}
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            onClick={() => advanceWeek(1)}
          >
            Next
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-slate-900/70 shadow-inner">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
          <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Suite</th>
              {week.map((date) => (
                <th key={date.toISOString()} className="px-4 py-2 text-left font-normal">
                  <span className="block text-slate-200">{formatDisplayDate(date)}</span>
                  <span className="text-[10px] text-slate-400">
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {suites.map((suite) => (
              <tr key={suite.id}>
                <td className="px-4 py-3 font-medium text-slate-100">{suite.label}</td>
                {week.map((date) => {
                  const cells = getBookingsForCell(suite.id, date);
                  const active = cells[0];
                  const overlapCount = cells.length;
                  return (
                    <td
                      key={`${suite.id}-${date.toISOString()}`}
                      className={clsx(
                        "px-4 py-3 align-top",
                        isSameDay(date, today) ? "bg-slate-800/60" : "bg-transparent"
                      )}
                    >
                      {active ? (
                        <div
                          className={clsx(
                            "rounded-md px-2 py-2 text-xs font-semibold text-white shadow",
                            statusColors[active.status]
                          )}
                        >
                          <p>{active.pet.name}</p>
                          <p className="text-[10px] font-normal text-slate-100/80">
                            {statusLabels[active.status]}
                          </p>
                          {overlapCount > 1 ? (
                            <p className="mt-1 text-[10px] font-medium text-amber-100">
                              +{overlapCount - 1} overlapping booking
                              {overlapCount - 1 > 1 ? "s" : ""}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">Vacant</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        {Object.entries(statusLabels).map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-2">
            <span className={clsx("inline-block h-3 w-3 rounded", statusColors[key as keyof typeof statusColors])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
