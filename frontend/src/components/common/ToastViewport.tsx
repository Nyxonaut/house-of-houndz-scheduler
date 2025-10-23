import clsx from "clsx";

import { useToast } from "@/context/ToastContext";

const variantClasses = {
  success: "border-emerald-300 bg-emerald-900/80 text-emerald-50",
  error: "border-rose-300 bg-rose-900/80 text-rose-50",
  info: "border-slate-300 bg-slate-900/80 text-slate-50"
};

export const ToastViewport = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto rounded-lg border px-4 py-3 shadow-lg backdrop-blur",
            variantClasses[toast.variant ?? "info"]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs text-slate-200/80">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-md bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
};

