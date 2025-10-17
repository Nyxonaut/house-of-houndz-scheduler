import { NewBookingForm } from "@/components/booking/NewBookingForm";

export const IntakePage: React.FC = () => (
  <section className="space-y-6">
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold text-white">New Booking Intake</h1>
      <p className="text-sm text-slate-300">
        Capture owner and pet details, assign suites, and block overlapping reservations. The form
        supports both existing clients and first-time visitors.
      </p>
    </header>

    <NewBookingForm />
  </section>
);

