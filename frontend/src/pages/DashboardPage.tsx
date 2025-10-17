import { useBookingContext } from "@/context/BookingContext";
import { statusColors, statusLabels } from "@/utils/status";
import { Spinner } from "@/components/common/Spinner";

export const DashboardPage: React.FC = () => {
  const { current, suites, bookings, loading } = useBookingContext();

  if (loading && bookings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Loading bookings..." />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Current Residents</h1>
        <p className="mt-1 text-sm text-slate-300">
          High-level snapshot. Detailed dashboard coming in Sprint 4.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Suites" value={suites.length} />
        <StatCard title="Current Check-ins" value={current.length} variant="success" />
        <StatCard
          title="Upcoming Bookings"
          value={bookings.filter((b) => b.status === "booked").length}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {current.map((booking) => (
          <article key={booking.id} className="rounded-lg bg-slate-800 p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">{booking.pet.name}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${statusColors[booking.status]}`}
              >
                {statusLabels[booking.status]}
              </span>
            </div>
            <dl className="mt-3 text-sm text-slate-300">
              <div>
                <dt className="font-medium text-slate-400">Suite</dt>
                <dd>{booking.suite.label}</dd>
              </div>
              <div className="mt-1">
                <dt className="font-medium text-slate-400">Owner</dt>
                <dd>
                  {booking.pet.owner.name} • {booking.pet.owner.phone || "Phone TBD"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs uppercase tracking-wide text-emerald-200">
              Full resident dashboard ships in Sprint 4.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  variant?: "default" | "success" | "warning";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, variant = "default" }) => {
  const variantStyles: Record<NonNullable<StatCardProps["variant"]>, string> = {
    default: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-slate-900"
  };
  return (
    <div className={`rounded-lg p-4 shadow ${variantStyles[variant]}`}>
      <dt className="text-sm font-medium uppercase tracking-wide">{title}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
    </div>
  );
};

