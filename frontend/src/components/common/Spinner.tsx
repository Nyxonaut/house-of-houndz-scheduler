import clsx from "clsx";
import type { FC } from "react";

interface SpinnerProps {
  label?: string;
  inline?: boolean;
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ label, inline = false, className }) => {
  const Wrapper = inline ? "span" : "div";
  return (
    <Wrapper
      className={clsx(
        "flex items-center gap-2 text-sm text-slate-200",
        inline && "inline-flex",
        className
      )}
    >
      <svg
        className="h-5 w-5 animate-spin text-emerald-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {label ?? "Loading..."}
    </Wrapper>
  );
};
