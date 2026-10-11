import { formatLabel, formatMiles } from './vehicleFormat';

const text = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '—');

/**
 * Every descriptive field from the API as [label, value] rows. Mileage is
 * shown in miles only (odometer_mi); odometer_km is intentionally omitted.
 */
export function getSpecRows(vehicle) {
  const location = [vehicle.city, vehicle.province].filter(Boolean).join(', ');
  return [
    ['VIN', text(vehicle.vin)],
    ['Lot', text(vehicle.lot)],
    ['Year', Number.isFinite(vehicle.year) ? String(vehicle.year) : '—'],
    ['Make', text(vehicle.make)],
    ['Model', text(vehicle.model)],
    ['Trim', text(vehicle.trim)],
    ['Body style', formatLabel(vehicle.body_style)],
    ['Exterior color', formatLabel(vehicle.exterior_color)],
    ['Interior color', formatLabel(vehicle.interior_color)],
    ['Engine', text(vehicle.engine)],
    ['Transmission', formatLabel(vehicle.transmission)],
    ['Drivetrain', text(vehicle.drivetrain)],
    ['Fuel type', formatLabel(vehicle.fuel_type)],
    ['Odometer', formatMiles(vehicle.odometer_mi)],
    ['Title status', formatLabel(vehicle.title_status)],
    ['Selling dealership', text(vehicle.selling_dealership)],
    ['Location', location || '—'],
  ];
}
