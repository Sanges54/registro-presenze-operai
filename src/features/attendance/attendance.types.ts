import type { Worker } from "@/features/workers/workers.types";

export const attendanceStatuses = [
  "present",
  "absent",
  "vacation",
  "sick",
  "leave",
  "rest",
  "travel"
] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];

export type Attendance = {
  id: string;
  user_id: string;
  worker_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  regular_hours: number;
  overtime_hours: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceRow = {
  worker: Worker;
  attendanceId: string | null;
  status: AttendanceStatus;
  regular_hours: number;
  overtime_hours: number;
  notes: string;
};

export type AttendanceUpsertInput = {
  id?: string;
  user_id: string;
  worker_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  regular_hours: number;
  overtime_hours: number;
  notes: string | null;
};
