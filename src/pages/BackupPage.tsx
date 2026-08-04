import { DatabaseBackup } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export function BackupPage() {
  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Strumenti" title="Backup" />
      <PlaceholderCard
        description="Funzioni di esportazione non ancora implementate."
        icon={<DatabaseBackup aria-hidden="true" className="size-5" />}
        title="Backup provvisorio"
      />
    </section>
  );
}
