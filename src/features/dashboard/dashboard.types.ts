import type { AttendanceStatus } from "@/features/attendance/attendance.types";

export type DashboardSummary = {
  activeWorkers: number;
  presentToday: number;
  absentToday: number;
  pendingToday: number;
  statusCounts: Record<AttendanceStatus, number>;
  regularHours: number;
  overtimeHours: number;
};
