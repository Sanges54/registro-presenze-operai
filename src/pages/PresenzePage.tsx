import {
  CalendarDays,
  LoaderCircle,
  Save,
  UserRoundCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import {
  listActiveWorkersForAttendance,
  listAttendanceByDate,
  listWorkersByIds,
  upsertAttendanceRows
} from "@/features/attendance/attendance.service";
import type {
  AttendanceRow,
  AttendanceStatus
} from "@/features/attendance/attendance.types";
import { attendanceStatuses } from "@/features/attendance/attendance.types";
import {
  attendanceStatusLabels,
  createAttendanceRows,
  getDefaultRegularHours,
  getTodayInputValue,
  sortRows
} from "@/features/attendance/attendance.utils";
import { getWorkerFullName } from "@/features/workers/workers.utils";

export function PresenzePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    () => searchParams.get("date") || getTodayInputValue()
  );
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const activeRowsCount = useMemo(
    () => rows.filter((row) => row.worker.active).length,
    [rows]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSelectedDay() {
      try {
        const [activeWorkers, attendanceRecords] = await Promise.all([
          listActiveWorkersForAttendance(),
          listAttendanceByDate(selectedDate)
        ]);

        const activeWorkerIds = new Set(
          activeWorkers.map((worker) => worker.id)
        );
        const historicalWorkerIds = attendanceRecords
          .map((attendance) => attendance.worker_id)
          .filter((workerId) => !activeWorkerIds.has(workerId));
        const historicalWorkers = await listWorkersByIds(historicalWorkerIds);

        if (isMounted) {
          setRows(
            createAttendanceRows(
              activeWorkers,
              attendanceRecords,
              historicalWorkers
            )
          );
          setHasUnsavedChanges(false);
          setMessage("");
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

    void loadSelectedDay();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  function updateRow(workerId: string, updates: Partial<AttendanceRow>) {
    setRows((current) =>
      sortRows(
        current.map((row) =>
          row.worker.id === workerId ? { ...row, ...updates } : row
        )
      )
    );
    setHasUnsavedChanges(true);
    setMessage("");
  }

  function updateStatus(workerId: string, status: AttendanceStatus) {
    updateRow(workerId, {
      status,
      regular_hours: getDefaultRegularHours(status)
    });
  }

  function markAllPresent() {
    setRows((current) =>
      sortRows(
        current.map((row) =>
          row.worker.active
            ? {
                ...row,
                status: "present",
                regular_hours: 8,
                overtime_hours: row.overtime_hours
              }
            : row
        )
      )
    );
    setHasUnsavedChanges(true);
    setMessage("");
  }

  async function handleSave() {
    if (!user) {
      setErrorMessage("Sessione non valida. Effettua di nuovo il login.");
      return;
    }

    const invalidRow = rows.find(
      (row) => row.regular_hours < 0 || row.overtime_hours < 0
    );

    if (invalidRow) {
      setErrorMessage("Le ore non possono essere negative.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const savedAttendance = await upsertAttendanceRows(
        rows.map((row) => ({
          user_id: user.id,
          worker_id: row.worker.id,
          attendance_date: selectedDate,
          status: row.status,
          regular_hours: row.regular_hours,
          overtime_hours: row.overtime_hours,
          notes: row.notes.trim() || null
        }))
      );

      const attendanceByWorkerId = new Map(
        savedAttendance.map((attendance) => [attendance.worker_id, attendance])
      );

      setRows((current) =>
        sortRows(
          current.map((row) => {
            const attendance = attendanceByWorkerId.get(row.worker.id);

            if (!attendance) {
              return row;
            }

            return {
              ...row,
              attendanceId: attendance.id,
              status: attendance.status,
              regular_hours: attendance.regular_hours,
              overtime_hours: attendance.overtime_hours,
              notes: attendance.notes ?? ""
            };
          })
        )
      );
      setHasUnsavedChanges(false);
      setMessage("Presenze salvate correttamente.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <PageHeader eyebrow="Giornata" title="Presenze" />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-app-text">Data</span>
          <span className="relative">
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-app-muted"
            />
            <input
              className="min-h-12 w-full rounded-lg border border-app-border bg-white pl-11 pr-3 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => {
                setIsLoading(true);
                setMessage("");
                setErrorMessage("");
                setSelectedDate(event.target.value);
                setHasUnsavedChanges(false);
              }}
              type="date"
              value={selectedDate}
            />
          </span>
        </label>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200"
          disabled={isLoading || activeRowsCount === 0}
          onClick={markAllPresent}
          type="button"
        >
          <UserRoundCheck aria-hidden="true" className="size-5" />
          Segna tutti presenti
        </button>
      </div>

      {hasUnsavedChanges ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          Ci sono modifiche non salvate.
        </p>
      ) : null}

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

      {isLoading ? (
        <LoadingAttendance />
      ) : rows.length === 0 ? (
        <EmptyAttendance />
      ) : (
        <>
          <AttendanceCards rows={rows} updateRow={updateRow} updateStatus={updateStatus} />
          <AttendanceTable rows={rows} updateRow={updateRow} updateStatus={updateStatus} />
        </>
      )}

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-30 px-5 md:static md:mt-auto md:px-0">
        <div className="mx-auto max-w-md md:max-w-none">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 md:max-w-xs"
            disabled={isLoading || isSaving || rows.length === 0}
            onClick={handleSave}
            type="button"
          >
            <Save aria-hidden="true" className="size-5" />
            {isSaving ? "Salvataggio" : "Salva"}
          </button>
        </div>
      </div>
    </section>
  );
}

type AttendanceViewProps = {
  rows: AttendanceRow[];
  updateStatus: (workerId: string, status: AttendanceStatus) => void;
  updateRow: (workerId: string, updates: Partial<AttendanceRow>) => void;
};

function AttendanceCards({ rows, updateStatus, updateRow }: AttendanceViewProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {rows.map((row) => (
        <article
          className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft"
          key={row.worker.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-app-text">
                {getWorkerFullName(row.worker)}
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                {row.worker.active
                  ? row.worker.job_title || "Mansione non indicata"
                  : "Operaio disattivato presente nello storico"}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          <AttendanceFields
            row={row}
            updateRow={updateRow}
            updateStatus={updateStatus}
          />
        </article>
      ))}
    </div>
  );
}

function AttendanceTable({ rows, updateStatus, updateRow }: AttendanceViewProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-soft md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-app-border bg-slate-50 text-xs font-semibold uppercase text-app-muted">
          <tr>
            <th className="px-3 py-3">Operaio</th>
            <th className="px-3 py-3">Stato</th>
            <th className="px-3 py-3">Ordinarie</th>
            <th className="px-3 py-3">Straordinarie</th>
            <th className="px-3 py-3">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {rows.map((row) => (
            <tr key={row.worker.id}>
              <td className="px-3 py-3 align-top">
                <p className="font-medium text-app-text">
                  {getWorkerFullName(row.worker)}
                </p>
                {!row.worker.active ? (
                  <p className="mt-1 text-xs text-app-muted">Storico</p>
                ) : null}
              </td>
              <td className="px-3 py-3 align-top">
                <StatusSelect
                  status={row.status}
                  onChange={(status) => updateStatus(row.worker.id, status)}
                />
              </td>
              <td className="px-3 py-3 align-top">
                <HoursInput
                  value={row.regular_hours}
                  onChange={(value) =>
                    updateRow(row.worker.id, { regular_hours: value })
                  }
                />
              </td>
              <td className="px-3 py-3 align-top">
                <HoursInput
                  value={row.overtime_hours}
                  onChange={(value) =>
                    updateRow(row.worker.id, { overtime_hours: value })
                  }
                />
              </td>
              <td className="px-3 py-3 align-top">
                <input
                  className="min-h-11 w-full rounded-lg border border-app-border bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    updateRow(row.worker.id, { notes: event.target.value })
                  }
                  type="text"
                  value={row.notes}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceFields({
  row,
  updateStatus,
  updateRow
}: {
  row: AttendanceRow;
  updateStatus: (workerId: string, status: AttendanceStatus) => void;
  updateRow: (workerId: string, updates: Partial<AttendanceRow>) => void;
}) {
  return (
    <div className="mt-4 grid gap-3">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-app-text">Stato</span>
        <StatusSelect
          status={row.status}
          onChange={(status) => updateStatus(row.worker.id, status)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-app-text">Ordinarie</span>
          <HoursInput
            value={row.regular_hours}
            onChange={(value) =>
              updateRow(row.worker.id, { regular_hours: value })
            }
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-app-text">
            Straordinarie
          </span>
          <HoursInput
            value={row.overtime_hours}
            onChange={(value) =>
              updateRow(row.worker.id, { overtime_hours: value })
            }
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-app-text">Note</span>
        <textarea
          className="min-h-20 rounded-lg border border-app-border bg-white px-3 py-2 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          onChange={(event) =>
            updateRow(row.worker.id, { notes: event.target.value })
          }
          value={row.notes}
        />
      </label>
    </div>
  );
}

function StatusSelect({
  status,
  onChange
}: {
  status: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}) {
  return (
    <select
      className="min-h-11 w-full rounded-lg border border-app-border bg-white px-3 text-sm font-medium text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      onChange={(event) => onChange(event.target.value as AttendanceStatus)}
      value={status}
    >
      {attendanceStatuses.map((option) => (
        <option key={option} value={option}>
          {attendanceStatusLabels[option]}
        </option>
      ))}
    </select>
  );
}

function HoursInput({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      className="min-h-11 w-full rounded-lg border border-app-border bg-white px-3 text-sm text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      min="0"
      onChange={(event) => onChange(Number(event.target.value))}
      step="0.25"
      type="number"
      value={value}
    />
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700">
      {attendanceStatusLabels[status]}
    </span>
  );
}

function LoadingAttendance() {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-app-border bg-app-surface p-6 shadow-soft">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          aria-hidden="true"
          className="size-7 text-blue-600 motion-safe:animate-spin"
        />
        <p className="text-sm font-medium text-app-muted">
          Caricamento presenze
        </p>
      </div>
    </div>
  );
}

function EmptyAttendance() {
  return (
    <div className="rounded-lg border border-dashed border-app-border bg-app-surface p-6 text-center shadow-soft">
      <h2 className="text-base font-semibold text-app-text">
        Nessun operaio attivo
      </h2>
      <p className="mt-2 text-sm leading-6 text-app-muted">
        Aggiungi o riattiva almeno un operaio per compilare una nuova giornata.
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Si e verificato un errore. Riprova.";
}
