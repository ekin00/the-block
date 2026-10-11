/**
 * The one field-mapping boundary between the Flask API and the UI.
 *
 * The view model keeps backend field names as-is (`odometer_mi`,
 * `selling_dealership`, `title_status`, ...). Never reintroduce mock names
 * (`mileage`, `seller`, `title_type`) anywhere in production code; adapt
 * here if the backend contract ever changes.
 */

export function mapVehicle(record) {
  if (!record || record.id == null) {
    return null;
  }
  return {
    ...record,
    id: String(record.id),
  };
}
