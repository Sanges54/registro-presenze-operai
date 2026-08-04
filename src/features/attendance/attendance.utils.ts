import type {
  Attendance,
  AttendanceRow,
  AttendanceStatus
} from "@/features/attendance/attendance.types";
import type { Worker } from "@/features/workers/workers.types";
import { sortWorkers } from "@/features/workers/workers.utils";

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Presente",
  absent: "Assente",
  vacation: "Ferie",
  sick: "Malattia",
  leave: "Permesso",
  rest: "Riposo",
  travel: "Trasferta"
};

export function getTodayInputValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export function getDefaultRegularHours(status: AttendanceStatus) {
  return status === "present" || status === "travel" ? 8 : 0;
}

export function createDefaultAttendanceRow(worker: Worker): AttendanceRow {
  return {
    worker,
    attendanceId: null,
    status: "present",
    regular_hours: 8,
    overtime_hours: 0,
    notes: ""
  };
}

export function createAttendanceRows(
  activeWorkers: Worker[],
  attendanceRecords: Attendance[],
  historicalWorkers: Worker[]
) {
  const workersById = new Map<string, Worker>();

  for (const worker of [...activeWorkers, ...historicalWorkers]) {
    workersById.set(worker.id, worker);
  }

  const rowsByWorkerId = new Map<string, AttendanceRow>();

  for (const worker of sortWorkers(activeWorkers)) {
    rowsByWorkerId.set(worker.id, createDefaultAttendanceRow(worker));
  }

  for (const attendance of attendanceRecords) {
    const worker = workersById.get(attendance.worker_id);

    if (!worker) {
      continue;
    }

    rowsByWorkerId.set(attendance.worker_id, {
      worker,
      attendanceId: attendance.id,
      status: attendance.status,
      regular_hours: attendance.regular_hours,
      overtime_hours: attendance.overtime_hours,
      notes: attendance.notes ?? ""
    });
  }

  return sortRows([...rowsByWorkerId.values()]);
}

export function sortRows(rows: AttendanceRow[]) {
  return [...rows].sort((a, b) => {
    if (a.worker.active !== b.worker.active) {
      return a.worker.active ? -1 : 1;
    }

    const lastNameCompare = a.worker.last_name.localeCompare(
      b.worker.last_name,
      "it",
      { sensitivity: "base" }
    );

    if (lastNameCompare !== 0) {
      return lastNameCompare;
    }

    return a.worker.first_name.localeCompare(b.worker.first_name, "it", {
      sensitivity: "base"
    });
  });
}
