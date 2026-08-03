const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toUtcDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value}T00:00:00Z`);
}

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(toUtcDate(value));
}

export function formatLongDate(value: string): string {
  return longDateFormatter.format(toUtcDate(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(toUtcDate(value));
}
