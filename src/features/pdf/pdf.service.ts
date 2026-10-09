import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanySettings } from "@/features/company-settings/company-settings.types";
import { downloadCompanyLogo } from "@/features/company-settings/company-settings.service";
import type {
  MonthDay,
  MonthlyTotals,
  WorkerMonthlySummary
} from "@/features/monthly-summary/monthly-summary.types";
import {
  formatMonthlyHours,
  monthNames,
  statusAbbreviations
} from "@/features/monthly-summary/monthly-summary.utils";
import { getWorkerFullName } from "@/features/workers/workers.utils";

type GenerateMonthlyPdfOptions = {
  settings: CompanySettings | null;
  days: MonthDay[];
  summaries: WorkerMonthlySummary[];
  totals: MonthlyTotals;
  month: number;
  year: number;
  includeNotes?: boolean;
};

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

const summaryHeaders = ["P", "A", "F", "M", "PE", "R", "T", "Ord.", "Str."];

export async function generateMonthlyPdf({
  settings,
  days,
  summaries,
  totals,
  month,
  year,
  includeNotes = true
}: GenerateMonthlyPdfOptions) {
  const doc = new jsPDF({
    format: "a4",
    orientation: "landscape",
    unit: "mm"
  }) as JsPdfWithAutoTable;
  const logoDataUrl = await getLogoDataUrl(settings?.logo_url ?? null);
  const marginX = 10;
  let cursorY = 10;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, getImageFormat(logoDataUrl), marginX, cursorY, 26, 18);
    } catch {
      // If an uncommon image encoding cannot be embedded, the PDF still remains valid.
    }
  }

  const textX = logoDataUrl ? 42 : marginX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(settings?.company_name || "Azienda", textX, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const companyLines = [
    settings?.address,
    settings?.vat_number ? `P. IVA: ${settings.vat_number}` : null,
    settings?.owner_name ? `Titolare: ${settings.owner_name}` : null
  ].filter(Boolean) as string[];

  for (const line of companyLines) {
    cursorY += 4;
    doc.text(line, textX, cursorY + 5);
  }

  cursorY = 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Rendiconto presenze", marginX, cursorY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${monthNames[month - 1]} ${year}`, marginX, cursorY + 6);

  autoTable(doc, {
    startY: 46,
    head: [buildPdfHeader(days)],
    body: summaries.map((summary) => buildPdfRow(summary, days)),
    theme: "grid",
    margin: { left: marginX, right: marginX },
    styles: {
      cellPadding: 0.7,
      fontSize: 5,
      halign: "center",
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: "linebreak",
      valign: "middle"
    },
    headStyles: {
      fillColor: [37, 99, 235],
      fontStyle: "bold",
      textColor: 255
    },
    columnStyles: buildColumnStyles(days.length),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        data.cell.styles.halign = "left";
      }

      if (
        data.section === "body" &&
        data.column.index > 0 &&
        data.column.index <= days.length &&
        days[data.column.index - 1]?.isWeekend
      ) {
        data.cell.styles.fillColor = [239, 246, 255];
      }
    }
  });

  const afterTableY = Math.min((doc.lastAutoTable?.finalY ?? 46) + 8, 184);

  autoTable(doc, {
    startY: afterTableY,
    head: [["Legenda", "Totali mese"]],
    body: [
      [
        "P Presente | A Assente | F Ferie | M Malattia | PE Permesso | R Riposo | T Trasferta",
        `Ore ordinarie: ${formatMonthlyHours(totals.regularHours)} | Ore straordinarie: ${formatMonthlyHours(totals.overtimeHours)}`
      ],
      [
        `Presenti ${totals.counts.present} | Assenze ${totals.counts.absent} | Ferie ${totals.counts.vacation} | Malattie ${totals.counts.sick}`,
        `Permessi ${totals.counts.leave} | Riposi ${totals.counts.rest} | Trasferte ${totals.counts.travel}`
      ]
    ],
    theme: "grid",
    margin: { left: marginX, right: marginX },
    styles: {
      cellPadding: 2,
      fontSize: 8,
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255
    }
  });

  // Read-only PDF section: attendance records and their stored notes are never changed.
  const noteRows = summaries.flatMap((summary) =>
    days.flatMap((day) => {
      const note = summary.attendanceByDate.get(day.date)?.notes?.trim();
      return note
        ? [[getWorkerFullName(summary.worker), day.date.split("-").reverse().join("/"), note]]
        : [];
    })
  );

  if (includeNotes && noteRows.length > 0) {
    const legendBottom = doc.lastAutoTable?.finalY ?? afterTableY;
    let notesStartY = legendBottom + 8;

    if (notesStartY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      notesStartY = 14;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Note sulle presenze", marginX, notesStartY);

    autoTable(doc, {
      startY: notesStartY + 4,
      head: [["Operaio", "Data", "Nota"]],
      body: noteRows,
      theme: "grid",
      margin: { left: marginX, right: marginX, bottom: 27 },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        overflow: "linebreak",
        valign: "top"
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 28 },
        2: { cellWidth: "auto" }
      },
      rowPageBreak: "avoid",
      showHead: "everyPage"
    });
  }

  addFooterAndSignature(doc, settings);

  const filenameSuffix = includeNotes ? "-con-note" : "";
  doc.save(`rendiconto-presenze-${year}-${String(month).padStart(2, "0")}${filenameSuffix}.pdf`);
}

function buildPdfHeader(days: MonthDay[]) {
  return [
    "Operaio",
    ...days.map((day) => String(day.day)),
    ...summaryHeaders
  ];
}

function buildPdfRow(summary: WorkerMonthlySummary, days: MonthDay[]) {
  return [
    getWorkerFullName(summary.worker),
    ...days.map((day) => {
      const attendance = summary.attendanceByDate.get(day.date);
      return attendance ? statusAbbreviations[attendance.status] : "";
    }),
    summary.counts.present,
    summary.counts.absent,
    summary.counts.vacation,
    summary.counts.sick,
    summary.counts.leave,
    summary.counts.rest,
    summary.counts.travel,
    formatMonthlyHours(summary.regularHours),
    formatMonthlyHours(summary.overtimeHours)
  ];
}

function buildColumnStyles(daysCount: number) {
  const columnStyles: Record<number, { cellWidth: number; halign?: "left" | "center" }> = {
    0: { cellWidth: 28, halign: "left" }
  };

  for (let index = 1; index <= daysCount; index += 1) {
    columnStyles[index] = { cellWidth: 5 };
  }

  for (let index = daysCount + 1; index <= daysCount + summaryHeaders.length; index += 1) {
    columnStyles[index] = { cellWidth: 6.5 };
  }

  return columnStyles;
}

async function getLogoDataUrl(path: string | null) {
  const logoBlob = await downloadCompanyLogo(path);

  if (!logoBlob) {
    return null;
  }

  return blobToDataUrl(logoBlob);
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Logo non leggibile."));
    reader.readAsDataURL(blob);
  });
}

function getImageFormat(dataUrl: string) {
  if (dataUrl.startsWith("data:image/png")) {
    return "PNG";
  }

  if (dataUrl.startsWith("data:image/webp")) {
    return "WEBP";
  }

  return "JPEG";
}

function addFooterAndSignature(doc: jsPDF, settings: CompanySettings | null) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setDrawColor(148, 163, 184);
    doc.line(pageWidth - 70, pageHeight - 20, pageWidth - 10, pageHeight - 20);
    doc.setFontSize(8);
    doc.text("Firma", pageWidth - 42, pageHeight - 15);

    if (settings?.pdf_footer_text) {
      doc.setFontSize(7);
      doc.text(settings.pdf_footer_text, 10, pageHeight - 10, {
        maxWidth: pageWidth - 95
      });
    }

    doc.setFontSize(7);
    doc.text(`Pagina ${page} di ${pageCount}`, pageWidth - 25, pageHeight - 5);
  }
}
