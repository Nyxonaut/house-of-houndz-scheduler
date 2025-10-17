import { useBookingContext } from "@/context/BookingContext";
import { formatDisplayDate, getWeekDates } from "@/utils/date";
import { statusColors, statusLabels } from "@/utils/status";

export const CalendarPage: React.FC = () => {
  const { bookings, suites } = useBookingContext();
  const week = getWeekDates();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Weekly Schedule Preview</h1>
        <p className="mt-1 text-sm text-slate-300">
          Final interactive calendar arrives in Sprint 4. Current grid illustrates structure.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg bg-slate-900/70 shadow-inner">
        <table className="min-w-full divide-y divide-slate-700 text-sm text-slate-200">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Suite</th>
              {week.map((date) => (
                <th key={date.toISOString()} className="px-4 py-2 text-left font-normal">
                  {formatDisplayDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {suites.map((suite) => (
              <tr key={suite.id}>
                <td className="px-4 py-3 font-medium text-slate-100">{suite.label}</td>
                {week.map((date) => {
                  const booking = bookings.find(
                    (entry) =>
                      entry.suite.id === suite.id &&
                      new Date(entry.start_date) <= date &&
                      new Date(entry.end_date) >= date
                  );
                  return (
                    <td key={date.toISOString()} className="px-4 py-2">
                      {booking ? (
                        <div
                          className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${statusColors[booking.status]}`}
                        >
                          {booking.pet.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Vacant</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="text-xs text-slate-400">
        Legend: {Object.entries(statusLabels).map(([key, label]) => (
          <span key={key} className="mr-3 inline-flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${statusColors[key as keyof typeof statusColors]}`} />
            {label}
          </span>
        ))}
      </footer>
    </section>
  );
};

