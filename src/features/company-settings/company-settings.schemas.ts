import { z } from "zod";

export const acceptedLogoTypes = ["image/png", "image/jpeg", "image/webp"];
export const maxLogoSizeBytes = 2 * 1024 * 1024;

export const companySettingsSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Il nome azienda e obbligatorio."),
  address: z.string().trim(),
  vat_number: z.string().trim(),
  owner_name: z.string().trim(),
  pdf_footer_text: z.string().trim(),
  logo_url: z.string().nullable()
});

export function validateLogoFile(file: File) {
  if (!acceptedLogoTypes.includes(file.type)) {
    return "Il logo deve essere PNG, JPG o WebP.";
  }

  if (file.size > maxLogoSizeBytes) {
    return "Il logo non deve superare 2 MB.";
  }

  return null;
}
