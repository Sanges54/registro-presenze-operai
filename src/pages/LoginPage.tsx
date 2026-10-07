import { Eye, EyeOff, KeyRound, LogIn } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/auth-context";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const {
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    signIn,
    requestPasswordReset
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isPasswordRecovery) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isPasswordRecovery, navigate, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Accesso non riuscito. Riprova."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const cleanEmail = (emailInputRef.current?.value || email).trim();

    setErrorMessage("");
    setInfoMessage("");

    if (!cleanEmail) {
      setErrorMessage("Inserisci prima l'indirizzo email.");
      return;
    }

    setIsResetting(true);

    try {
      await requestPasswordReset(cleanEmail);
      setInfoMessage(
        "Email inviata. Apri il link ricevuto per scegliere una nuova password."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Invio dell'email non riuscito. Riprova."
      );
    } finally {
      setIsResetting(false);
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && !isPasswordRecovery) {
    return <Navigate replace to={redirectTo} />;
  }

  return (
    <main className="flex min-h-dvh bg-app-background px-5 py-[calc(env(safe-area-inset-top)+2rem)] text-app-text">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center gap-6">
        <PageHeader eyebrow="Accesso" title="Login" />

        <form
          className="rounded-lg border border-app-border bg-app-surface p-5 shadow-soft"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
            <LogIn aria-hidden="true" className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-app-text">
            Accesso amministratore
          </h2>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Inserisci email e password dell'utente creato in Supabase.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-app-text">Email</span>
              <input
                autoComplete="email"
                ref={emailInputRef}
                className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setEmail(event.target.value)}
                onInput={(event) => setEmail(event.currentTarget.value)}
                required
                type="email"
                value={email}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-app-text">
                Password
              </span>
              <span className="relative">
                <input
                  autoComplete="current-password"
                  className="min-h-12 w-full rounded-lg border border-app-border bg-white px-3 pr-12 text-base text-app-text outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
          </div>

          <button
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isResetting}
            onClick={handlePasswordReset}
            type="button"
          >
            <KeyRound aria-hidden="true" className="size-4" />
            {isResetting ? "Invio in corso..." : "Password dimenticata?"}
          </button>

          {infoMessage ? (
            <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-700">
              {infoMessage}
            </p>
          ) : null}

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
            <LogIn aria-hidden="true" className="size-5" />
            {isSubmitting ? "Accesso in corso" : "Accedi"}
          </button>
        </form>
      </section>
    </main>
  );
}
