import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import type { AttendanceStatus } from "@/features/attendance/attendance.types";
import { getCompanySettings } from "@/features/company-settings/company-settings.service";
import {
  listAttendanceForMonth,
  listWorkersForMonthlySummary
} from "@/features/monthly-summary/monthly-summary.service";
import type {
  MonthDay,
  WorkerMonthlySummary
} from "@/features/monthly-summary/monthly-summary.types";
import {
  buildMonthlySummary,
  calculateMonthlyTotals,
  formatMonthlyHours,
  getCurrentMonthValue,
  getCurrentYearValue,
  getMonthBounds,
  getMonthDays,
  monthNames,
  statusAbbreviations
} from "@/features/monthly-summary/monthly-summary.utils";
import { generateMonthlyPdf } from "@/features/pdf/pdf.service";
import { getWorkerFullName } from "@/features/workers/workers.utils";

export function RendicontoPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [selectedYear, setSelectedYear] = useState(getCurrentYearValue);
  const [summaries, setSummaries] = useState<WorkerMonthlySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const days = useMemo(
    () => getMonthDays(selectedYear, selectedMonth),
    [selectedMonth, selectedYear]
  );
  const totals = useMemo(() => calculateMonthlyTotals(summaries), [summaries]);
  const years = useMemo(() => {
    const currentYear = getCurrentYearValue();
    return Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { startDate, endDate } = getMonthBounds(
          selectedYear,
          selectedMonth
        );
        const [workers, attendance] = await Promise.all([
          listWorkersForMonthlySummary(),
          listAttendanceForMonth(startDate, endDate)
        ]);

        if (isMounted) {
          setSummaries(buildMonthlySummary(workers, attendance));
          setMessage("");
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

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear]);

  async function handleGeneratePdf(includeNotes: boolean) {
    if (summaries.length === 0) {
      setErrorMessage("Non ci sono dati da esportare nel mese selezionato.");
      return;
    }

    setIsGeneratingPdf(true);
    setErrorMessage("");
    setMessage("");

    try {
      const settings = await getCompanySettings();
      await generateMonthlyPdf({
        settings,
        days,
        summaries,
        totals,
        month: selectedMonth,
        year: selectedYear,
        includeNotes
      });
      setMessage(includeNotes ? "PDF con note generato correttamente." : "PDF generato correttamente.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Mensile" title="Rendiconto">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
            disabled={isLoading || isGeneratingPdf || summaries.length === 0}
            onClick={() => void handleGeneratePdf(false)}
            type="button"
          >
            <Download aria-hidden="true" className="size-5" />
            {isGeneratingPdf ? "Generazione..." : "Genera PDF"}
          </button>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 text-sm font-semibold text-blue-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
            disabled={isLoading || isGeneratingPdf || summaries.length === 0}
            onClick={() => void handleGeneratePdf(true)}
            type="button"
          >
            <Download aria-hidden="true" className="size-5" />
            {isGeneratingPdf ? "Generazione..." : "Genera PDF con note"}
          </button>
        </div>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-app-text">Mese</span>
          <select
            className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            value={selectedMonth}
          >
            {monthNames.map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-app-text">Anno</span>
          <select
            className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            value={selectedYear}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Legend />

      {isLoading ? <LoadingSummary /> : null}

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && summaries.length === 0 ? <EmptySummary /> : null}

      {!isLoading && summaries.length > 0 ? (
        <>
          <MonthlyTotals totals={totals} />
          <MobileSummaryCards days={days} summaries={summaries} />
          <DesktopSummaryTable days={days} summaries={summaries} />
        </>
      ) : null}
    </section>
  );
}

function Legend() {
  const statuses: AttendanceStatus[] = [
    "present",
    "absent",
    "vacation",
    "sick",
    "leave",
    "rest",
    "travel"
  ];

  return (
    <div className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft">
      <h2 className="text-base font-semibold text-app-text">Legenda</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <span
            className="inline-flex min-h-8 items-center gap-2 rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700"
            key={status}
          >
            {statusAbbreviations[status]} = {labelSingular(status)}
          </span>
        ))}
      </div>
    </div>
  );
}

function MonthlyTotals({
  totals
}: {
  totals: ReturnType<typeof calculateMonthlyTotals>;
}) {
  const items = [
    ["Presenti", totals.counts.present],
    ["Assenze", totals.counts.absent],
    ["Ferie", totals.counts.vacation],
    ["Malattie", totals.counts.sick],
    ["Permessi", totals.counts.leave],
    ["Riposi", totals.counts.rest],
    ["Trasferte", totals.counts.travel],
    ["Ore ord.", formatMonthlyHours(totals.regularHours)],
    ["Ore straord.", formatMonthlyHours(totals.overtimeHours)]
  ];

  return (
    <div className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft">
      <h2 className="text-base font-semibold text-app-text">
        Totali complessivi
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(([label, value]) => (
          <div
            className="rounded-lg border border-app-border bg-white p-3"
            key={label}
          >
            <p className="text-xs font-medium text-app-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-app-text">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSummaryCards({
  days,
  summaries
}: {
  days: MonthDay[];
  summaries: WorkerMonthlySummary[];
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {summaries.map((summary) => (
        <article
          className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft"
          key={summary.worker.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-app-text">
                {getWorkerFullName(summary.worker)}
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                {summary.worker.active ? "Attivo" : "Disattivato"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const attendance = summary.attendanceByDate.get(day.date);
              return (
                <div
                  className={[
                    "flex min-h-10 flex-col items-center justify-center rounded-lg border text-[11px]",
                    day.isWeekend ? "border-blue-100 bg-blue-50" : "border-app-border bg-white"
                  ].join(" ")}
                  key={day.date}
                >
                  <span className="text-app-muted">{day.day}</span>
                  <span className="font-semibold text-app-text">
                    {attendance ? statusAbbreviations[attendance.status] : "-"}
                  </span>
                </div>
              );
            })}
          </div>

          <SummaryCounters summary={summary} />
        </article>
      ))}
    </div>
  );
}

function DesktopSummaryTable({
  days,
  summaries
}: {
  days: MonthDay[];
  summaries: WorkerMonthlySummary[];
}) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-app-border bg-app-surface shadow-soft md:block">
      <table className="min-w-max text-left text-xs">
        <thead className="border-b border-app-border bg-slate-50 text-app-muted">
          <tr>
            <th className="sticky left-0 z-10 min-w-48 bg-slate-50 px-3 py-3">
              Operaio
            </th>
            {days.map((day) => (
              <th
                className={[
                  "min-w-10 px-2 py-3 text-center",
                  day.isWeekend ? "bg-blue-50 text-blue-700" : ""
                ].join(" ")}
                key={day.date}
              >
                {day.day}
              </th>
            ))}
            {summaryHeaders.map((header) => (
              <th className="px-2 py-3 text-center" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {summaries.map((summary) => (
            <tr key={summary.worker.id}>
              <td className="sticky left-0 z-10 bg-white px-3 py-3">
                <p className="font-semibold text-app-text">
                  {getWorkerFullName(summary.worker)}
                </p>
                {!summary.worker.active ? (
                  <p className="mt-1 text-[11px] text-app-muted">
                    Disattivato
                  </p>
                ) : null}
              </td>
              {days.map((day) => {
                const attendance = summary.attendanceByDate.get(day.date);
                return (
                  <td
                    className={[
                      "px-2 py-3 text-center font-semibold",
                      day.isWeekend ? "bg-blue-50 text-blue-700" : "text-app-text"
                    ].join(" ")}
                    key={day.date}
                  >
                    {attendance ? statusAbbreviations[attendance.status] : "-"}
                  </td>
                );
              })}
              {summaryValues(summary).map((value, index) => (
                <td
                  className="px-2 py-3 text-center font-semibold tabular-nums text-app-text"
                  key={`${summary.worker.id}-${summaryHeaders[index]}`}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const summaryHeaders = ["P", "A", "F", "M", "PE", "R", "T", "Ord.", "Str."];

function SummaryCounters({ summary }: { summary: WorkerMonthlySummary }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {summaryHeaders.map((header, index) => (
        <div className="rounded-lg border border-app-border bg-white p-2" key={header}>
          <p className="text-[11px] font-medium text-app-muted">{header}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-app-text">
            {summaryValues(summary)[index]}
          </p>
        </div>
      ))}
    </div>
  );
}

function summaryValues(summary: WorkerMonthlySummary) {
  return [
    summary.counts.present,
    summary.counts.absent,
    summary.counts.vacation,
    summary.counts.sick,
    summary.counts.leave,
    summary.counts.rest,
    summary.counts.travel,
    formatMonthlyHours(summary.regularHours),
    formatMonthlyHours(summary.overtimeHours)
  ];
}

function LoadingSummary() {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-app-border bg-app-surface p-6 shadow-soft">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          aria-hidden="true"
          className="size-7 text-blue-600 motion-safe:animate-spin"
        />
        <p className="text-sm font-medium text-app-muted">
          Caricamento rendiconto
        </p>
      </div>
    </div>
  );
}

function EmptySummary() {
  return (
    <div className="rounded-lg border border-dashed border-app-border bg-app-surface p-6 text-center shadow-soft">
      <h2 className="text-base font-semibold text-app-text">
        Nessun dato per il mese selezionato
      </h2>
      <p className="mt-2 text-sm leading-6 text-app-muted">
        Non ci sono operai attivi o presenze registrate nel periodo.
      </p>
    </div>
  );
}

function labelSingular(status: AttendanceStatus) {
  const labels: Record<AttendanceStatus, string> = {
    present: "Presente",
    absent: "Assente",
    vacation: "Ferie",
    sick: "Malattia",
    leave: "Permesso",
    rest: "Riposo",
    travel: "Trasferta"
  };

  return labels[status];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Impossibile caricare il rendiconto.";
}
