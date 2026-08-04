import { Outlet } from "react-router-dom";
import {
  DesktopSidebar,
  MobileBottomNav,
  SecondaryMenu
} from "@/components/navigation/AppNavigation";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-app-background text-app-text antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
        <DesktopSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-app-border bg-app-background/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-app-muted">Registro</p>
                <p className="text-base font-semibold leading-tight">
                  Presenze Operai
                </p>
              </div>
              <SecondaryMenu />
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-5 sm:px-6 md:px-8 md:pb-10 md:pt-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
