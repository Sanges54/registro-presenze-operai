import { HashRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AppRoutes } from "@/routes/AppRoutes";

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
