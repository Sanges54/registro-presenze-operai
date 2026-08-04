import type { Worker } from "@/features/workers/workers.types";

export function sortWorkers(workers: Worker[]) {
  return [...workers].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    const lastNameCompare = a.last_name.localeCompare(b.last_name, "it", {
      sensitivity: "base"
    });

    if (lastNameCompare !== 0) {
      return lastNameCompare;
    }

    return a.first_name.localeCompare(b.first_name, "it", {
      sensitivity: "base"
    });
  });
}

export function getWorkerFullName(worker: Worker) {
  return `${worker.first_name} ${worker.last_name}`;
}
