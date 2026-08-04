import { supabase } from "@/lib/supabase/client";
import type {
  CompanySettings,
  CompanySettingsFormValues
} from "@/features/company-settings/company-settings.types";

const companySettingsFields =
  "id,user_id,company_name,logo_url,address,vat_number,owner_name,pdf_footer_text,created_at,updated_at";

const companyLogoBucket = "company-logos";

function normalizeSettings(values: CompanySettingsFormValues, userId: string) {
  return {
    user_id: userId,
    company_name: values.company_name.trim(),
    logo_url: values.logo_url,
    address: values.address.trim() || null,
    vat_number: values.vat_number.trim() || null,
    owner_name: values.owner_name.trim() || null,
    pdf_footer_text: values.pdf_footer_text.trim() || null
  };
}

export async function getCompanySettings() {
  const { data, error } = await supabase
    .from("company_settings")
    .select(companySettingsFields)
    .maybeSingle<CompanySettings>();

  if (error) {
    throw new Error("Impossibile caricare le impostazioni aziendali.");
  }

  return data;
}

export async function saveCompanySettings(
  values: CompanySettingsFormValues,
  userId: string
) {
  const { data, error } = await supabase
    .from("company_settings")
    .upsert(normalizeSettings(values, userId), { onConflict: "user_id" })
    .select(companySettingsFields)
    .single<CompanySettings>();

  if (error) {
    throw new Error("Impossibile salvare le impostazioni aziendali.");
  }

  return data;
}

export async function uploadCompanyLogo(userId: string, file: File) {
  const extension = getLogoExtension(file);
  const path = `${userId}/logo-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(companyLogoBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true
    });

  if (error) {
    throw new Error("Impossibile caricare il logo aziendale.");
  }

  return path;
}

export async function removeCompanyLogo(path: string | null) {
  if (!path) {
    return;
  }

  const { error } = await supabase.storage
    .from(companyLogoBucket)
    .remove([path]);

  if (error) {
    throw new Error("Impossibile rimuovere il logo aziendale.");
  }
}

export async function createCompanyLogoSignedUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(companyLogoBucket)
    .createSignedUrl(path, 3600);

  if (error) {
    throw new Error("Impossibile caricare l'anteprima del logo.");
  }

  return data.signedUrl;
}

export async function downloadCompanyLogo(path: string | null) {
  if (!path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(companyLogoBucket)
    .download(path);

  if (error) {
    return null;
  }

  return data;
}

function getLogoExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}
