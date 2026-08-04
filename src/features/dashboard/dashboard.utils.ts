export function formatItalianDate(inputDate: string) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${inputDate}T00:00:00`));
}

export function formatHours(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value);
}
