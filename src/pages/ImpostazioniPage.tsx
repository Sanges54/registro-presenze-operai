import { ImageUp, LoaderCircle, Save, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import {
  companySettingsSchema,
  validateLogoFile
} from "@/features/company-settings/company-settings.schemas";
import {
  createCompanyLogoSignedUrl,
  getCompanySettings,
  removeCompanyLogo,
  saveCompanySettings,
  uploadCompanyLogo
} from "@/features/company-settings/company-settings.service";
import type {
  CompanySettings,
  CompanySettingsFormValues
} from "@/features/company-settings/company-settings.types";

const emptyValues: CompanySettingsFormValues = {
  company_name: "",
  address: "",
  vat_number: "",
  owner_name: "",
  pdf_footer_text: "",
  logo_url: null
};

export function ImpostazioniPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [values, setValues] =
    useState<CompanySettingsFormValues>(emptyValues);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [removeLogoRequested, setRemoveLogoRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const data = await getCompanySettings();
        const signedUrl = await createCompanyLogoSignedUrl(data?.logo_url ?? null);

        if (isMounted) {
          setSettings(data);
          setValues({
            company_name: data?.company_name ?? "",
            address: data?.address ?? "",
            vat_number: data?.vat_number ?? "",
            owner_name: data?.owner_name ?? "",
            pdf_footer_text: data?.pdf_footer_text ?? "",
            logo_url: data?.logo_url ?? null
          });
          setLogoPreviewUrl(signedUrl);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateValue<K extends keyof CompanySettingsFormValues>(
    key: K,
    value: CompanySettingsFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const validationError = validateLogoFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      event.target.value = "";
      return;
    }

    setLogoFile(file);
    setRemoveLogoRequested(false);
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
    setMessage("");
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setRemoveLogoRequested(true);
    updateValue("logo_url", null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setErrorMessage("Sessione non valida. Effettua di nuovo il login.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const parsed = companySettingsSchema.safeParse(values);

      if (!parsed.success) {
        setErrorMessage(parsed.error.issues[0]?.message ?? "Controlla i dati.");
        return;
      }

      let logoPath = parsed.data.logo_url;

      if (removeLogoRequested || logoFile) {
        await removeCompanyLogo(settings?.logo_url ?? null);
        logoPath = null;
      }

      if (logoFile) {
        logoPath = await uploadCompanyLogo(user.id, logoFile);
      }

      const savedSettings = await saveCompanySettings(
        { ...parsed.data, logo_url: logoPath },
        user.id
      );
      const signedUrl = await createCompanyLogoSignedUrl(
        savedSettings.logo_url
      );

      setSettings(savedSettings);
      setValues({
        company_name: savedSettings.company_name,
        address: savedSettings.address ?? "",
        vat_number: savedSettings.vat_number ?? "",
        owner_name: savedSettings.owner_name ?? "",
        pdf_footer_text: savedSettings.pdf_footer_text ?? "",
        logo_url: savedSettings.logo_url
      });
      setLogoFile(null);
      setLogoPreviewUrl(signedUrl);
      setRemoveLogoRequested(false);
      setMessage("Impostazioni salvate correttamente.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Sistema" title="Impostazioni" />

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-app-border bg-app-surface p-6 shadow-soft">
          <LoaderCircle
            aria-hidden="true"
            className="size-7 text-blue-600 motion-safe:animate-spin"
          />
        </div>
      ) : (
        <form
          className="grid gap-5 rounded-lg border border-app-border bg-app-surface p-4 shadow-soft sm:p-5"
          onSubmit={handleSubmit}
        >
          {message ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
              {message}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="grid gap-4">
              <TextField
                label="Nome azienda"
                onChange={(value) => updateValue("company_name", value)}
                required
                value={values.company_name}
              />
              <TextField
                label="Indirizzo"
                onChange={(value) => updateValue("address", value)}
                value={values.address}
              />
              <TextField
                label="Partita IVA"
                onChange={(value) => updateValue("vat_number", value)}
                value={values.vat_number}
              />
              <TextField
                label="Nome titolare"
                onChange={(value) => updateValue("owner_name", value)}
                value={values.owner_name}
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-app-text">
                  Testo pie di pagina PDF
                </span>
                <textarea
                  className="min-h-24 rounded-lg border border-app-border bg-white px-3 py-2 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) =>
                    updateValue("pdf_footer_text", event.target.value)
                  }
                  value={values.pdf_footer_text}
                />
              </label>
            </div>

            <div className="rounded-lg border border-app-border bg-white p-4">
              <h2 className="text-base font-semibold text-app-text">Logo</h2>
              <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-app-border bg-slate-50">
                {logoPreviewUrl ? (
                  <img
                    alt="Anteprima logo aziendale"
                    className="max-h-full max-w-full object-contain"
                    src={logoPreviewUrl}
                  />
                ) : (
                  <ImageUp
                    aria-hidden="true"
                    className="size-8 text-app-muted"
                  />
                )}
              </div>
              <label className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-app-border px-3 text-sm font-semibold text-app-text transition hover:bg-slate-100 focus-within:ring-4 focus-within:ring-blue-100">
                <ImageUp aria-hidden="true" className="size-4" />
                Carica logo
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleLogoChange}
                  type="file"
                />
              </label>
              <button
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
                onClick={handleRemoveLogo}
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Rimuovi logo
              </button>
              <p className="mt-3 text-xs leading-5 text-app-muted">
                Formati ammessi: PNG, JPG, WebP. Dimensione massima: 2 MB.
              </p>
            </div>
          </div>

          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
            disabled={isSaving}
            type="submit"
          >
            <Save aria-hidden="true" className="size-5" />
            {isSaving ? "Salvataggio" : "Salva impostazioni"}
          </button>
        </form>
      )}
    </section>
  );
}

function TextField({
  label,
  value,
  required,
  onChange
}: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-app-text">{label}</span>
      <input
        className="min-h-12 rounded-lg border border-app-border bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type="text"
        value={value}
      />
    </label>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Si e verificato un errore. Riprova.";
}
