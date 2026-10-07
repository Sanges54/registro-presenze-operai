import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  AuthContext,
  type AuthContextValue
} from "@/features/auth/auth-context";
import { getItalianAuthError } from "@/features/auth/auth-errors";
import {
  isSupabaseConfigured,
  supabase
} from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(
    () => new URLSearchParams(window.location.search).get("recovery") === "1"
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    }

    void loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase non e ancora configurato.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(getItalianAuthError(error.message));
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error("Logout non riuscito. Riprova.");
    }

    setIsPasswordRecovery(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase non e ancora configurato.");
    }

    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}?recovery=1`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      throw new Error(getItalianAuthError(error.message));
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new Error(getItalianAuthError(error.message));
    }

    setIsPasswordRecovery(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      isPasswordRecovery,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword
    }),
    [
      isLoading,
      isPasswordRecovery,
      session,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
