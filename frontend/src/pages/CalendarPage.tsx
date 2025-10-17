import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { Skeleton } from "@/components/common/Skeleton";
import { useBookingContext } from "@/context/BookingContext";

export const CalendarPage: React.FC = () => {
  const { bookings, suites, loading } = useBookingContext();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Weekly Schedule</h1>
        <p className="text-sm text-slate-300">
          Navigate week by week to validate availability and spot overlaps. Days with conflicts
          highlight remaining capacity.
        </p>
      </header>

      {loading && !bookings.length ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <WeeklyCalendar suites={suites} bookings={bookings} />
      )}
    </section>
  );
};
