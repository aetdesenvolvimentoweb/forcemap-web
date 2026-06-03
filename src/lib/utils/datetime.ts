/**
 * Formata uma string de data/hora no padrão "YYYY-MM-DDTHH:mm"
 * (vinda de inputs datetime-local) para "DD/MM/YYYY HH:mm".
 */
export function formatDateTime(value: string | undefined | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Data "de hoje" no fuso de Brasília (UTC-3), no formato "YYYY-MM-DD". */
export function currentServiceDate(): string {
  return new Date(Date.now() - SAO_PAULO_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Recebe a data do serviço ("YYYY-MM-DD") e devolve o par de exibição
 * { start, end } em "DD/MM/YYYY", onde end é o dia seguinte ao início.
 */
export function serviceDateRange(dateStr: string | undefined | null): {
  start: string;
  end: string;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr ?? "");
  const base = match
    ? new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      )
    : new Date(`${currentServiceDate()}T00:00:00Z`);
  const next = new Date(base);
  next.setUTCDate(base.getUTCDate() + 1);
  const fmt = (d: Date): string =>
    `${String(d.getUTCDate()).padStart(2, "0")}/${String(
      d.getUTCMonth() + 1,
    ).padStart(2, "0")}/${d.getUTCFullYear()}`;
  return { start: fmt(base), end: fmt(next) };
}
