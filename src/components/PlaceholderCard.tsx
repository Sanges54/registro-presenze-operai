import type { ReactNode } from "react";

type PlaceholderCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  value?: string;
};

export function PlaceholderCard({
  title,
  description,
  icon,
  value
}: PlaceholderCardProps) {
  return (
    <article className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-app-text">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-app-muted">{description}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            {icon}
          </div>
        ) : null}
      </div>
      {value ? (
        <p className="mt-5 text-3xl font-semibold tabular-nums text-app-text">
          {value}
        </p>
      ) : null}
    </article>
  );
}
