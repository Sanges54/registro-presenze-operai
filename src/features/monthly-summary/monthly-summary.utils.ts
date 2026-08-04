import type {
  Attendance,
  AttendanceStatus
} from "@/features/attendance/attendance.types";
import type {
  MonthDay,
  MonthlyTotals,
  WorkerMonthlySummary
} from "@/features/monthly-summary/monthly-summary.types";
import type { Worker } from "@/features/workers/workers.types";
import { getWorkerFullName } from "@/features/workers/workers.utils";

export const monthNames = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre"
];

export const statusAbbreviations: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  vacation: "F",
  sick: "M",
  leave: "PE",
  rest: "R",
  travel: "T"
};

export const monthlyStatusLabels: Record<AttendanceStatus, string> = {
  present: "Presenti",
  absent: "Assenze",
  vacation: "Ferie",
  sick: "Malattie",
  leave: "Permessi",
  rest: "Riposi",
  travel: "Trasferte"
};

export function getCurrentMonthValue() {
  return new Date().getMonth() + 1;
}

export function getCurrentYearValue() {
  return new Date().getFullYear();
}

export function getMonthBounds(year: number, month: number) {
  const startDate = formatDatePart(year, month, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = formatDatePart(year, month, lastDay);

  return { startDate, endDate, lastDay };
}

export function getMonthDays(year: number, month: number): MonthDay[] {
  const { lastDay } = getMonthBounds(year, month);

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = formatDatePart(year, month, day);
    const weekday = new Date(`${date}T00:00:00`).getDay();

    return {
      day,
      date,
      isWeekend: weekday === 0 || weekday === 6
    };
  });
}

export function buildMonthlySummary(
  workers: Worker[],
  attendanceRecords: Attendance[]
) {
  const attendanceWorkerIds = new Set(
    attendanceRecords.map((attendance) => attendance.worker_id)
  );
  const visibleWorkers = workers
    .filter((worker) => worker.active || attendanceWorkerIds.has(worker.id))
    .sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }

      return getWorkerFullName(a).localeCompare(getWorkerFullName(b), "it", {
        sensitivity: "base"
      });
    });

  const attendanceByWorkerId = new Map<string, Attendance[]>();

  for (const attendance of attendanceRecords) {
    const current = attendanceByWorkerId.get(attendance.worker_id) ?? [];
    current.push(attendance);
    attendanceByWorkerId.set(attendance.worker_id, current);
  }

  const summaries = visibleWorkers.map((worker) => {
    const workerAttendance = attendanceByWorkerId.get(worker.id) ?? [];
    const attendanceByDate = new Map<string, Attendance>();
    const counts = createEmptyCounts();
    let regularHours = 0;
    let overtimeHours = 0;

    for (const attendance of workerAttendance) {
      attendanceByDate.set(attendance.attendance_date, attendance);
      counts[attendance.status] += 1;
      regularHours += attendance.regular_hours;
      overtimeHours += attendance.overtime_hours;
    }

    return {
      worker,
      attendanceByDate,
      counts,
      regularHours,
      overtimeHours
    };
  });

  return summaries;
}

export function calculateMonthlyTotals(
  summaries: WorkerMonthlySummary[]
): MonthlyTotals {
  const totals: MonthlyTotals = {
    counts: createEmptyCounts(),
    regularHours: 0,
    overtimeHours: 0
  };

  for (const summary of summaries) {
    for (const status of Object.keys(totals.counts) as AttendanceStatus[]) {
      totals.counts[status] += summary.counts[status];
    }

    totals.regularHours += summary.regularHours;
    totals.overtimeHours += summary.overtimeHours;
  }

  return totals;
}

export function formatMonthlyHours(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2
  }).format(value);
}

function createEmptyCounts(): Record<AttendanceStatus, number> {
  return {
    present: 0,
    absent: 0,
    vacation: 0,
    sick: 0,
    leave: 0,
    rest: 0,
    travel: 0
  };
}

function formatDatePart(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}
