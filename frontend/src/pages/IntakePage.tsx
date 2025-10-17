import { Alert } from "@/components/common/Alert";

export const IntakePage: React.FC = () => (
  <section className="space-y-4">
    <header>
      <h1 className="text-2xl font-semibold text-white">New Booking Intake</h1>
      <p className="mt-1 text-sm text-slate-300">
        Detailed intake form to be implemented during Sprint 4. This page reserves layout space and
        validates routing.
      </p>
    </header>

    <Alert variant="warning">
      Intake form UI coming soon. Use the BookingContext actions directly during development or add
      temporary controls as needed.
    </Alert>
  </section>
);

