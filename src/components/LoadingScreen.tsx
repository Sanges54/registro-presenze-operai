import { LoaderCircle } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app-background px-5 text-app-text">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          aria-hidden="true"
          className="size-7 text-blue-600 motion-safe:animate-spin"
        />
        <p className="text-sm font-medium text-app-muted">
          Caricamento sessione
        </p>
      </div>
    </div>
  );
}
