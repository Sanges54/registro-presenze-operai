export type Worker = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  hire_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkerFormValues = {
  first_name: string;
  last_name: string;
  job_title: string;
  hire_date: string;
  active: boolean;
};

export type WorkerCreateInput = WorkerFormValues & {
  user_id: string;
};

export type WorkerUpdateInput = WorkerFormValues;
