import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={clsx("animate-pulse rounded-md bg-slate-700/60", className)} />
);

