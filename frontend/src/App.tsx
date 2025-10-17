import { NavLink, Route, Routes } from "react-router-dom";

import { Alert } from "./components/common/Alert";
import { Spinner } from "./components/common/Spinner";
import { useBookingContext } from "./context/BookingContext";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IntakePage } from "./pages/IntakePage";

export function App() {
  const { loading, error, refreshAll, lastSynced } = useBookingContext();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">House of Houndz Scheduler</h1>
            <p className="text-sm text-slate-400">
              Sprint 3: data layer & routing scaffolding for the kennel dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading ? <Spinner label="Syncing..." /> : null}
            <button
              type="button"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
              onClick={() => refreshAll()}
            >
              Refresh Data
            </button>
          </div>
        </div>

        <nav className="bg-slate-900">
          <div className="mx-auto flex max-w-6xl gap-4 px-6 py-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Calendar
            </NavLink>
            <NavLink
              to="/intake"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Intake
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {lastSynced ? (
          <p className="text-xs text-slate-500">Last synced: {new Date(lastSynced).toLocaleString()}</p>
        ) : null}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/intake" element={<IntakePage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        Next Sprint: implement booking form, live calendar, and resident dashboard components.
      </footer>
    </div>
  );
}

export default App;
