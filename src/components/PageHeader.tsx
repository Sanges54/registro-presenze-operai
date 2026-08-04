import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function PageHeader({ title, eyebrow, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium text-blue-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-normal text-app-text sm:text-3xl">
          {title}
        </h1>
      </div>
      {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
    </header>
  );
}
