export type CompanySettings = {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  address: string | null;
  vat_number: string | null;
  owner_name: string | null;
  pdf_footer_text: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanySettingsFormValues = {
  company_name: string;
  address: string;
  vat_number: string;
  owner_name: string;
  pdf_footer_text: string;
  logo_url: string | null;
};
