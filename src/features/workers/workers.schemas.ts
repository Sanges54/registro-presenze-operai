import { z } from "zod";

export const workerFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "Il nome e obbligatorio."),
  last_name: z
    .string()
    .trim()
    .min(1, "Il cognome e obbligatorio."),
  job_title: z.string().trim(),
  hire_date: z.string(),
  active: z.boolean()
});

export type WorkerFormSchema = z.infer<typeof workerFormSchema>;
