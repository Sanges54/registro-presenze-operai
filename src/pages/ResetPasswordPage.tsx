import { Eye, EyeOff, KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/auth-context";

export function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("La nuova password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le due password non coincidono.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      await signOut();

      window.history.replaceState(
        {},
        "",
        `${window.location.origin}${import.meta.env.BASE_URL}#/login`
      );
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare la password. Riprova."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh bg-app-background px-5 py-[calc(env(safe-area-inset-top)+2rem)] text-app-text">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center gap-6">
        <PageHeader eyebrow="Sicurezza" title="Nuova password" />

        <form
          className="rounded-lg border border-app-border bg-app-surface p-5 shadow-soft"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
            <KeyRound aria-hidden="true" className="size-6" />
          </div>

          <h2 className="text-base font-semibold text-app-text">
            Imposta una nuova password
          </h2>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Scegli una password di almeno 8 caratteri e confermala.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-app-text">
                Nuova password
              </span>
              <span className="relative">
                <input
                  autoComplete="new-password"
                  className="min-h-12 w-full rounded-lg border border-app-border bg-white px-3 pr-12 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={
                    showPassword ? "Nascondi password" : "Mostra password"
                  }
                  className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-app-muted transition hover:bg-slate-100 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-100"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-5" />
                  ) : (
                    <Eye aria-hidden="true" className="size-5" />
                  )}
                </button>
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-app-text">
                Conferma password
              </span>
              <input
                autoComplete="new-password"
                className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSubmitting}
            type="submit"
          >
            <KeyRound aria-hidden="true" className="size-5" />
            {isSubmitting ? "Salvataggio..." : "Salva nuova password"}
          </button>
        </form>
      </section>
    </main>
  );
}
