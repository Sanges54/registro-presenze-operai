import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/features/auth/auth-context";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { BackupPage } from "@/pages/BackupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ImpostazioniPage } from "@/pages/ImpostazioniPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OperaiPage } from "@/pages/OperaiPage";
import { PresenzePage } from "@/pages/PresenzePage";
import { RendicontoPage } from "@/pages/RendicontoPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

export function AppRoutes() {
  const { isLoading, isPasswordRecovery } = useAuth();
  const recoveryFromUrl =
    new URLSearchParams(window.location.search).get("recovery") === "1";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isPasswordRecovery || recoveryFromUrl) {
    return <ResetPasswordPage />;
  }

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="presenze" element={<PresenzePage />} />
          <Route path="operai" element={<OperaiPage />} />
          <Route path="rendiconto" element={<RendicontoPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="impostazioni" element={<ImpostazioniPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
