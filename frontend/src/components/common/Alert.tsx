import clsx from "clsx";
import type { PropsWithChildren } from "react";

interface AlertProps extends PropsWithChildren {
  variant?: "info" | "success" | "warning" | "danger";
}

const styles: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-rose-100 text-rose-800 border-rose-200"
};

export const Alert: React.FC<AlertProps> = ({ children, variant = "info" }) => (
  <div className={clsx("rounded-md border px-4 py-3 text-sm", styles[variant])}>{children}</div>
);

