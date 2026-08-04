export function getItalianAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "Email o password non corretti.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Email non confermata. Controlla la casella di posta.";
  }

  if (normalizedMessage.includes("too many requests")) {
    return "Troppi tentativi. Riprova tra qualche minuto.";
  }

  if (normalizedMessage.includes("failed to fetch")) {
    return "Impossibile contattare Supabase. Controlla la connessione.";
  }

  return "Accesso non riuscito. Controlla i dati e riprova.";
}
