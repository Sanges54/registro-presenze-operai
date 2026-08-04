import { supabase } from "@/lib/supabase/client";
import type {
  Attendance,
  AttendanceUpsertInput
} from "@/features/attendance/attendance.types";
import type { Worker } from "@/features/workers/workers.types";

const attendanceFields =
  "id,user_id,worker_id,attendance_date,status,regular_hours,overtime_hours,notes,created_at,updated_at";

const workerFields =
  "id,user_id,first_name,last_name,job_title,hire_date,active,created_at,updated_at";

export async function listActiveWorkersForAttendance() {
  const { data, error } = await supabase
    .from("workers")
    .select(workerFields)
    .eq("active", true)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .returns<Worker[]>();

  if (error) {
    throw new Error("Impossibile caricare gli operai attivi.");
  }

  return data;
}

export async function listAttendanceByDate(attendanceDate: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(attendanceFields)
    .eq("attendance_date", attendanceDate)
    .returns<Attendance[]>();

  if (error) {
    throw new Error("Impossibile caricare le presenze della giornata.");
  }

  return data;
}

export async function listWorkersByIds(workerIds: string[]) {
  if (workerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("workers")
    .select(workerFields)
    .in("id", workerIds)
    .returns<Worker[]>();

  if (error) {
    throw new Error("Impossibile caricare lo storico degli operai.");
  }

  return data;
}

export async function upsertAttendanceRows(rows: AttendanceUpsertInput[]) {
  if (rows.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("attendance")
    .upsert(rows, {
      onConflict: "worker_id,attendance_date"
    })
    .select(attendanceFields)
    .returns<Attendance[]>();

  if (error) {
    throw new Error("Impossibile salvare le presenze.");
  }

  return data;
}
