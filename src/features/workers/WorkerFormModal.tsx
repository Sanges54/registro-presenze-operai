import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import { workerFormSchema } from "@/features/workers/workers.schemas";
import type {
  Worker,
  WorkerFormValues
} from "@/features/workers/workers.types";

const initialValues: WorkerFormValues = {
  first_name: "",
  last_name: "",
  job_title: "",
  hire_date: "",
  active: true
};

function getInitialValues(worker: Worker | null): WorkerFormValues {
  if (!worker) {
    return initialValues;
  }

  return {
    first_name: worker.first_name,
    last_name: worker.last_name,
    job_title: worker.job_title ?? "",
    hire_date: worker.hire_date ?? "",
    active: worker.active
  };
}

type WorkerFormModalProps = {
  worker: Worker | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: WorkerFormValues) => Promise<void>;
};

export function WorkerFormModal({
  worker,
  isSubmitting,
  onClose,
  onSubmit
}: WorkerFormModalProps) {
  const [values, setValues] = useState<WorkerFormValues>(() =>
    getInitialValues(worker)
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const result = workerFormSchema.safeParse(values);

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? "Controlla i dati.");
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Salvataggio non riuscito. Riprova."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-lg border border-app-border bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Operaio</p>
            <h2 className="mt-1 text-xl font-semibold text-app-text">
              {worker ? "Modifica operaio" : "Aggiungi operaio"}
            </h2>
          </div>
          <button
            aria-label="Chiudi"
            className="flex size-10 items-center justify-center rounded-lg text-app-muted transition hover:bg-slate-100 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-100"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-text">Nome</span>
            <input
              className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  first_name: event.target.value
                }))
              }
              required
              type="text"
              value={values.first_name}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-text">Cognome</span>
            <input
              className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  last_name: event.target.value
                }))
              }
              required
              type="text"
              value={values.last_name}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-text">
              Mansione
            </span>
            <input
              className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  job_title: event.target.value
                }))
              }
              type="text"
              value={values.job_title}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-app-text">
              Data di assunzione
            </span>
            <input
              className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  hire_date: event.target.value
                }))
              }
              type="date"
              value={values.hire_date}
            />
          </label>

          <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-app-border px-3">
            <span className="text-sm font-medium text-app-text">Attivo</span>
            <input
              checked={values.active}
              className="size-5 accent-blue-600"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  active: event.target.checked
                }))
              }
              type="checkbox"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="min-h-12 rounded-lg border border-app-border px-4 text-sm font-semibold text-app-text transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={onClose}
              type="button"
            >
              Annulla
            </button>
            <button
              className="min-h-12 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Salvataggio" : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
