import { supabase } from "@/lib/supabase/client";
import type {
  Worker,
  WorkerCreateInput,
  WorkerUpdateInput
} from "@/features/workers/workers.types";

const workerFields =
  "id,user_id,first_name,last_name,job_title,hire_date,active,created_at,updated_at";

function mapWorkerPayload(values: WorkerCreateInput | WorkerUpdateInput) {
  return {
    ...("user_id" in values ? { user_id: values.user_id } : {}),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    job_title: values.job_title.trim() || null,
    hire_date: values.hire_date || null,
    active: values.active
  };
}

export async function listWorkers() {
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

export async function createWorker(values: WorkerCreateInput) {
  const { data, error } = await supabase
    .from("workers")
    .insert(mapWorkerPayload(values))
    .select(workerFields)
    .single<Worker>();

  if (error) {
    throw new Error("Impossibile aggiungere l'operaio.");
  }

  return data;
}

export async function updateWorker(id: string, values: WorkerUpdateInput) {
  const { data, error } = await supabase
    .from("workers")
    .update(mapWorkerPayload(values))
    .eq("id", id)
    .select(workerFields)
    .single<Worker>();

  if (error) {
    throw new Error("Impossibile modificare l'operaio.");
  }

  return data;
}

export async function setWorkerActive(id: string, active: boolean) {
  const { data, error } = await supabase
    .from("workers")
    .update({ active })
    .eq("id", id)
    .select(workerFields)
    .single<Worker>();

  if (error) {
    throw new Error(
      active
        ? "Impossibile riattivare l'operaio."
        : "Impossibile disattivare l'operaio."
    );
  }

  return data;
}

export async function deleteWorker(id: string) {
  const { error } = await supabase.from("workers").delete().eq("id", id);

  if (error) {
    throw new Error("Impossibile eliminare definitivamente l'operaio.");
  }
}
