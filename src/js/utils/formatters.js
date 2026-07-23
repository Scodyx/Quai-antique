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
