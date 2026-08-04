import { Link } from "react-router-dom";
import { ArrowLeft, TriangleAlert } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6">
      <div>
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-soft">
          <TriangleAlert aria-hidden="true" className="size-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-normal">
          Pagina non trovata
        </h1>
        <p className="mt-2 text-base leading-7 text-app-muted">
          Il percorso richiesto non esiste.
        </p>
      </div>

      <Link
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200"
        to="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Torna alla Home
      </Link>
    </section>
  );
}
