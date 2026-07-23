export function formatTime(time) {
  return time.replace(':', ' h ');
}

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export function formatPrice(priceInCents) {
  return priceFormatter.format(Number(priceInCents) / 100);
}

export function formatOpeningHours(period) {
  if (!period?.open || !period?.close) return 'Fermé';
  return `${period.open} – ${period.close}`;
}

export function formatDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR').format(new Date(year, month - 1, day));
}

export function centsToEurosInput(cents) {
  return (Number(cents) / 100).toFixed(2);
}

export function eurosInputToCents(value) {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 && cents <= 32767 ? cents : null;
}
