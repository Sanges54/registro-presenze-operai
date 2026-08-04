import { supabase } from "@/lib/supabase/client";
import type { Attendance } from "@/features/attendance/attendance.types";
import type { Worker } from "@/features/workers/workers.types";

const attendanceFields =
  "id,user_id,worker_id,attendance_date,status,regular_hours,overtime_hours,notes,created_at,updated_at";

const workerFields =
  "id,user_id,first_name,last_name,job_title,hire_date,active,created_at,updated_at";

export async function listWorkersForMonthlySummary() {
  const { data, error } = await supabase
    .from("workers")
    .select(workerFields)
    .order("active", { ascending: false })
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .returns<Worker[]>();

  if (error) {
    throw new Error("Impossibile caricare gli operai.");
  }

  return data;
}

export async function listAttendanceForMonth(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(attendanceFields)
    .gte("attendance_date", startDate)
    .lte("attendance_date", endDate)
    .returns<Attendance[]>();

  if (error) {
    throw new Error("Impossibile caricare le presenze del mese.");
  }

  return data;
}
