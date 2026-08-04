import {
  listActiveWorkersForAttendance,
  listAttendanceByDate
} from "@/features/attendance/attendance.service";
import type { DashboardSummary } from "@/features/dashboard/dashboard.types";

export async function getDashboardSummary(today: string): Promise<DashboardSummary> {
  const [activeWorkers, attendanceRecords] = await Promise.all([
    listActiveWorkersForAttendance(),
    listAttendanceByDate(today)
  ]);

  const activeWorkerIds = new Set(activeWorkers.map((worker) => worker.id));
  const activeAttendance = attendanceRecords.filter((attendance) =>
    activeWorkerIds.has(attendance.worker_id)
  );
  const registeredWorkerIds = new Set(
    activeAttendance.map((attendance) => attendance.worker_id)
  );

  const statusCounts: DashboardSummary["statusCounts"] = {
    present: 0,
    absent: 0,
    vacation: 0,
    sick: 0,
    leave: 0,
    rest: 0,
    travel: 0
  };

  let regularHours = 0;
  let overtimeHours = 0;

  for (const attendance of activeAttendance) {
    statusCounts[attendance.status] += 1;
    regularHours += attendance.regular_hours;
    overtimeHours += attendance.overtime_hours;
  }

  return {
    activeWorkers: activeWorkers.length,
    presentToday: statusCounts.present,
    absentToday: statusCounts.absent,
    pendingToday: activeWorkers.length - registeredWorkerIds.size,
    statusCounts,
    regularHours,
    overtimeHours
  };
}
