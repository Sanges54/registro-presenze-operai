import {
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRound,
  UserRoundX
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import { WorkerFormModal } from "@/features/workers/WorkerFormModal";
import {
  createWorker,
  deleteWorker,
  listWorkers,
  setWorkerActive,
  updateWorker
} from "@/features/workers/workers.service";
import type {
  Worker,
  WorkerFormValues
} from "@/features/workers/workers.types";
import {
  getWorkerFullName,
  sortWorkers
} from "@/features/workers/workers.utils";

export function OperaiPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedWorkers = useMemo(() => sortWorkers(workers), [workers]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await listWorkers();

        if (isMounted) {
          setWorkers(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkers();

    return () => {
      isMounted = false;
    };
  }, []);

  function openCreateForm() {
    setSelectedWorker(null);
    setIsFormOpen(true);
    clearMessages();
  }

  function openEditForm(worker: Worker) {
    setSelectedWorker(worker);
    setIsFormOpen(true);
    clearMessages();
  }

  async function handleSubmit(values: WorkerFormValues) {
    if (!user) {
      setErrorMessage("Sessione non valida. Effettua di nuovo il login.");
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      if (selectedWorker) {
        const updatedWorker = await updateWorker(selectedWorker.id, values);
        setWorkers((current) =>
          sortWorkers(
            current.map((worker) =>
              worker.id === updatedWorker.id ? updatedWorker : worker
            )
          )
        );
        setMessage("Operaio modificato correttamente.");
      } else {
        const createdWorker = await createWorker({
          ...values,
          user_id: user.id
        });
        setWorkers((current) => sortWorkers([...current, createdWorker]));
        setMessage("Operaio aggiunto correttamente.");
      }

      setIsFormOpen(false);
      setSelectedWorker(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(worker: Worker) {
    clearMessages();

    try {
      const updatedWorker = await setWorkerActive(worker.id, !worker.active);
      setWorkers((current) =>
        sortWorkers(
          current.map((currentWorker) =>
            currentWorker.id === updatedWorker.id
              ? updatedWorker
              : currentWorker
          )
        )
      );
      setMessage(
        updatedWorker.active
          ? "Operaio riattivato correttamente."
          : "Operaio disattivato correttamente."
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleDelete(worker: Worker) {
    const confirmed = window.confirm(
      `Eliminare definitivamente ${getWorkerFullName(worker)}? Questa azione non puo essere annullata.`
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      await deleteWorker(worker.id);
      setWorkers((current) =>
        current.filter((currentWorker) => currentWorker.id !== worker.id)
      );
      setMessage("Operaio eliminato definitivamente.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Anagrafica" title="Operai">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
          onClick={openCreateForm}
          type="button"
        >
          <Plus aria-hidden="true" className="size-5" />
          Aggiungi operaio
        </button>
      </PageHeader>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingWorkers />
      ) : sortedWorkers.length === 0 ? (
        <EmptyWorkers onCreate={openCreateForm} />
      ) : (
        <>
          <WorkersCards
            onDelete={handleDelete}
            onEdit={openEditForm}
            onToggleActive={handleToggleActive}
            workers={sortedWorkers}
          />
          <WorkersTable
            onDelete={handleDelete}
            onEdit={openEditForm}
            onToggleActive={handleToggleActive}
            workers={sortedWorkers}
          />
        </>
      )}

      {isFormOpen ? (
        <WorkerFormModal
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedWorker(null);
          }}
          onSubmit={handleSubmit}
          worker={selectedWorker}
        />
      ) : null}
    </section>
  );
}

function LoadingWorkers() {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-app-border bg-app-surface p-6 shadow-soft">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          aria-hidden="true"
          className="size-7 text-blue-600 motion-safe:animate-spin"
        />
        <p className="text-sm font-medium text-app-muted">
          Caricamento operai
        </p>
      </div>
    </div>
  );
}

function EmptyWorkers({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-app-border bg-app-surface p-6 text-center shadow-soft">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <UserRound aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-app-text">
        Nessun operaio inserito
      </h2>
      <p className="mt-2 text-sm leading-6 text-app-muted">
        Aggiungi il primo operaio per iniziare a gestire l'anagrafica.
      </p>
      <button
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200"
        onClick={onCreate}
        type="button"
      >
        <Plus aria-hidden="true" className="size-5" />
        Aggiungi operaio
      </button>
    </div>
  );
}

type WorkersViewProps = {
  workers: Worker[];
  onEdit: (worker: Worker) => void;
  onToggleActive: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
};

function WorkersCards({
  workers,
  onEdit,
  onToggleActive,
  onDelete
}: WorkersViewProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {workers.map((worker) => (
        <article
          className="rounded-lg border border-app-border bg-app-surface p-4 shadow-soft"
          key={worker.id}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UserRound aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-app-text">
                    {getWorkerFullName(worker)}
                  </h2>
                  <p className="mt-1 text-sm text-app-muted">
                    {worker.job_title || "Mansione non indicata"}
                  </p>
                </div>
                <WorkerStatusBadge active={worker.active} />
              </div>
              <p className="mt-3 text-sm text-app-muted">
                Assunzione: {formatDate(worker.hire_date)}
              </p>
            </div>
          </div>

          <WorkerActions
            onDelete={() => onDelete(worker)}
            onEdit={() => onEdit(worker)}
            onToggleActive={() => onToggleActive(worker)}
            worker={worker}
          />
        </article>
      ))}
    </div>
  );
}

function WorkersTable({
  workers,
  onEdit,
  onToggleActive,
  onDelete
}: WorkersViewProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-soft md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-app-border bg-slate-50 text-xs font-semibold uppercase text-app-muted">
          <tr>
            <th className="px-4 py-3">Cognome</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Mansione</th>
            <th className="px-4 py-3">Assunzione</th>
            <th className="px-4 py-3">Stato</th>
            <th className="px-4 py-3 text-right">Azioni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {workers.map((worker) => (
            <tr key={worker.id}>
              <td className="px-4 py-3 font-medium text-app-text">
                {worker.last_name}
              </td>
              <td className="px-4 py-3 text-app-text">{worker.first_name}</td>
              <td className="px-4 py-3 text-app-muted">
                {worker.job_title || "-"}
              </td>
              <td className="px-4 py-3 text-app-muted">
                {formatDate(worker.hire_date)}
              </td>
              <td className="px-4 py-3">
                <WorkerStatusBadge active={worker.active} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <WorkerActions
                    compact
                    onDelete={() => onDelete(worker)}
                    onEdit={() => onEdit(worker)}
                    onToggleActive={() => onToggleActive(worker)}
                    worker={worker}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkerStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex min-h-8 items-center rounded-full bg-emerald-50 px-3 text-xs font-semibold text-emerald-700"
          : "inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-app-muted"
      }
    >
      {active ? "Attivo" : "Disattivato"}
    </span>
  );
}

type WorkerActionsProps = {
  worker: Worker;
  compact?: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
};

function WorkerActions({
  worker,
  compact = false,
  onEdit,
  onToggleActive,
  onDelete
}: WorkerActionsProps) {
  const buttonClass = compact
    ? "flex size-10 items-center justify-center rounded-lg text-app-muted transition hover:bg-slate-100 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-100"
    : "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-app-border px-3 text-sm font-semibold text-app-text transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100";

  return (
    <div className={compact ? "flex gap-1" : "mt-4 grid grid-cols-3 gap-2"}>
      <button
        aria-label={`Modifica ${getWorkerFullName(worker)}`}
        className={buttonClass}
        onClick={onEdit}
        type="button"
      >
        <Pencil aria-hidden="true" className="size-4" />
        {compact ? null : "Modifica"}
      </button>
      <button
        aria-label={
          worker.active
            ? `Disattiva ${getWorkerFullName(worker)}`
            : `Riattiva ${getWorkerFullName(worker)}`
        }
        className={buttonClass}
        onClick={onToggleActive}
        type="button"
      >
        {worker.active ? (
          <UserRoundX aria-hidden="true" className="size-4" />
        ) : (
          <RotateCcw aria-hidden="true" className="size-4" />
        )}
        {compact ? null : worker.active ? "Disattiva" : "Riattiva"}
      </button>
      <button
        aria-label={`Elimina ${getWorkerFullName(worker)}`}
        className={
          compact
            ? "flex size-10 items-center justify-center rounded-lg text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
            : "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
        }
        onClick={onDelete}
        type="button"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {compact ? null : "Elimina"}
      </button>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("it-IT").format(new Date(`${value}T00:00:00`));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Si e verificato un errore. Riprova.";
}
