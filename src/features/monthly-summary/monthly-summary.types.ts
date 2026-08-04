import type {
  Attendance,
  AttendanceStatus
} from "@/features/attendance/attendance.types";
import type { Worker } from "@/features/workers/workers.types";

export type MonthDay = {
  day: number;
  date: string;
  isWeekend: boolean;
};

export type WorkerMonthlySummary = {
  worker: Worker;
  attendanceByDate: Map<string, Attendance>;
  counts: Record<AttendanceStatus, number>;
  regularHours: number;
  overtimeHours: number;
};

export type MonthlyTotals = {
  counts: Record<AttendanceStatus, number>;
  regularHours: number;
  overtimeHours: number;
};
