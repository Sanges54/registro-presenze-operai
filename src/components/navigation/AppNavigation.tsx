import {
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  DatabaseBackup,
  Home,
  LogOut,
  Menu,
  Settings,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/auth-context";

const primaryItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/presenze", label: "Presenze", icon: CalendarCheck },
  { to: "/operai", label: "Operai", icon: Users },
  { to: "/rendiconto", label: "Rendiconto", icon: ClipboardList }
];

const secondaryItems = [
  { to: "/backup", label: "Backup", icon: DatabaseBackup },
  { to: "/impostazioni", label: "Impostazioni", icon: Settings }
];

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-soft backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {primaryItems.map((item) => (
          <NavItem key={item.to} compact {...item} />
        ))}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const { signOut, user } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-app-border bg-white px-3 py-5 md:flex md:flex-col">
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <BriefcaseBusiness aria-hidden="true" className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-app-muted">Registro</p>
          <p className="text-base font-semibold leading-tight text-app-text">
            Presenze Operai
          </p>
        </div>
      </div>

      <nav aria-label="Navigazione principale" className="grid gap-1">
        {primaryItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-8 border-t border-app-border pt-5">
        <p className="px-3 text-xs font-semibold uppercase text-app-muted">
          Strumenti
        </p>
        <nav aria-label="Menu secondario" className="mt-2 grid gap-1">
          {secondaryItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-app-border pt-4">
        <p className="truncate px-3 text-xs text-app-muted">
          {user?.email ?? "Utente autenticato"}
        </p>
        <button
          className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-app-muted transition hover:bg-slate-100 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => void signOut()}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-5" />
          Esci
        </button>
      </div>
    </aside>
  );
}

export function SecondaryMenu() {
  const { signOut } = useAuth();

  return (
    <details className="relative md:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-app-border bg-white px-3 text-app-text transition active:scale-[0.98]">
        <Menu aria-hidden="true" className="size-5" />
        <span className="sr-only">Apri menu secondario</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-app-border bg-white p-2 shadow-soft">
        {secondaryItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <button
          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-app-muted transition hover:bg-slate-100 hover:text-app-text focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => void signOut()}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-5" />
          Esci
        </button>
      </div>
    </details>
  );
}

type NavItemProps = {
  to: string;
  label: string;
  icon: typeof Home;
  compact?: boolean;
};

function NavItem({ to, label, icon: Icon, compact = false }: NavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        [
          "flex min-h-12 items-center rounded-lg text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-100",
          compact ? "flex-col justify-center gap-1 px-1 py-1" : "gap-3 px-3",
          isActive
            ? "bg-blue-600 text-white"
            : "text-app-muted hover:bg-slate-100 hover:text-app-text"
        ].join(" ")
      }
      to={to}
    >
      <Icon aria-hidden="true" className={compact ? "size-5" : "size-5"} />
      <span className={compact ? "text-[11px] leading-none" : ""}>{label}</span>
    </NavLink>
  );
}
