/**
 * Display formatting for vehicle details. Values come straight from the
 * backend view model (see vehicleMapping.js); nothing here invents data.
 */

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(value) {
  return Number.isFinite(value) ? moneyFormatter.format(value) : '—';
}

export function formatMiles(value) {
  return Number.isFinite(value) ? `${value.toLocaleString('en-US')} mi` : 'Mileage unavailable';
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

export function formatDateTime(date) {
  return date instanceof Date && !Number.isNaN(date.getTime())
    ? dateTimeFormatter.format(date)
    : '—';
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Compact countdown such as "2d 4h", "3h 12m", "45m" or "<1m". */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '0m';
  }
  if (ms < MINUTE) {
    return '<1m';
  }
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/** "automatic" -> "Automatic", "all-wheel drive" -> "All-Wheel Drive". */
export function formatLabel(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return '—';
  }
  return value
    .trim()
    .replace(/(^|[\s-])([a-z])/g, (_match, sep, letter) => `${sep}${letter.toUpperCase()}`);
}

export function vehicleTitle(vehicle) {
  return [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(' ');
}

export function placeholderImage(vehicle) {
  const text = encodeURIComponent(vehicleTitle(vehicle) || 'Vehicle photo');
  return `https://placehold.co/800x600/1a1a2e/eaeaea?text=${text}`;
}
