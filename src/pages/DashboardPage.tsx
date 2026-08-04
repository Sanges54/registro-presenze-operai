import {
  CircleDashed,
  ClipboardCheck,
  CalendarPlus,
  Clock,
  LoaderCircle,
  MapPinned,
  Palmtree,
  Stethoscope,
  UserCheck,
  UserX,
  Coffee,
  FileClock
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";
import { getTodayInputValue } from "@/features/attendance/attendance.utils";
import { getDashboardSummary } from "@/features/dashboard/dashboard.service";
import type { DashboardSummary } from "@/features/dashboard/dashboard.types";
import {
  formatHours,
  formatItalianDate
} from "@/features/dashboard/dashboard.utils";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const today = getTodayInputValue();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary(today);

        if (isMounted) {
          setSummary(data);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    function handleFocus() {
      setIsLoading(true);
      void loadDashboard();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [today]);

  const mainStats = [
    {
      title: "Operai attivi",
      value: summary ? String(summary.activeWorkers) : "—",
      icon: <UserCheck aria-hidden="true" className="size-5" />
    },
    {
      title: "Presenti oggi",
      value: summary ? String(summary.presentToday) : "—",
      icon: <ClipboardCheck aria-hidden="true" className="size-5" />
    },
    {
      title: "Assenti oggi",
      value: summary ? String(summary.absentToday) : "—",
      icon: <UserX aria-hidden="true" className="size-5" />
    },
    {
      title: "Da compilare",
      value: summary ? String(summary.pendingToday) : "—",
      icon: <CircleDashed aria-hidden="true" className="size-5" />
    }
  ];

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Dashboard" title="Registro Presenze Operai">
        <Link
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
          to={`/presenze?date=${today}`}
        >
          <CalendarPlus aria-hidden="true" className="size-5" />
          Registra presenze di oggi
        </Link>
      </PageHeader>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-950 shadow-soft">
        <h2 className="text-base font-semibold">Situazione di oggi</h2>
        <p className="mt-1 text-sm leading-6 text-blue-800">
          {formatItalianDate(today)}
        </p>
      </div>

      {isLoading ? <DashboardLoading /> : null}

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {mainStats.map((stat) => (
          <PlaceholderCard key={stat.title} {...stat} />
        ))}
      </div>

      {summary && summary.activeWorkers === 0 ? (
        <div className="rounded-lg border border-dashed border-app-border bg-app-surface p-6 text-center shadow-soft">
          <h2 className="text-base font-semibold text-app-text">
            Nessun operaio attivo
          </h2>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Aggiungi o riattiva almeno un operaio per iniziare a compilare le
            presenze.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft sm:p-5">
          <h2 className="text-base font-semibold text-app-text">
            Altri stati di oggi
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SmallStat
              icon={<Palmtree aria-hidden="true" className="size-4" />}
              label="Ferie"
              value={summary ? summary.statusCounts.vacation : 0}
            />
            <SmallStat
              icon={<Stethoscope aria-hidden="true" className="size-4" />}
              label="Malattia"
              value={summary ? summary.statusCounts.sick : 0}
            />
            <SmallStat
              icon={<FileClock aria-hidden="true" className="size-4" />}
              label="Permessi"
              value={summary ? summary.statusCounts.leave : 0}
            />
            <SmallStat
              icon={<Coffee aria-hidden="true" className="size-4" />}
              label="Riposo"
              value={summary ? summary.statusCounts.rest : 0}
            />
            <SmallStat
              icon={<MapPinned aria-hidden="true" className="size-4" />}
              label="Trasferta"
              value={summary ? summary.statusCounts.travel : 0}
            />
          </div>
        </div>

        <div className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft sm:p-5">
          <h2 className="text-base font-semibold text-app-text">Ore di oggi</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SmallStat
              icon={<Clock aria-hidden="true" className="size-4" />}
              label="Ore ordinarie"
              value={summary ? formatHours(summary.regularHours) : "0"}
            />
            <SmallStat
              icon={<Clock aria-hidden="true" className="size-4" />}
              label="Ore straordinarie"
              value={summary ? formatHours(summary.overtimeHours) : "0"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SmallStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-app-border bg-white px-3">
      <div className="flex items-center gap-2 text-app-muted">
        <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-semibold tabular-nums text-app-text">
        {value}
      </span>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-app-border bg-app-surface p-4 shadow-soft">
      <div className="flex items-center gap-3 text-sm font-medium text-app-muted">
        <LoaderCircle
          aria-hidden="true"
          className="size-5 text-blue-600 motion-safe:animate-spin"
        />
        Caricamento Dashboard
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Impossibile caricare la Dashboard.";
}
