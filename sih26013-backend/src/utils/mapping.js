/**
 * Generic field-mapping engine used by the ingestion service.
 * A mapping profile's `field_mappings` is a JSON object:
 *   { "sourceFieldName": { "target": "canonicalFieldName", "transform": "someTransformKey" } }
 *
 * applyMapping() takes one raw source row (plain object) and returns:
 *   { mapped: {...canonical fields...}, unmapped: {...leftover raw fields...} }
 */

const TRANSFORMS = {
  identity: (v) => v,
  trim: (v) => (typeof v === 'string' ? v.trim() : v),
  uppercase: (v) => (typeof v === 'string' ? v.toUpperCase() : v),
  acres_to_sqm: (v) => (v === null || v === undefined || v === '' ? null : Number(v) * 4046.8564224),
  hectares_to_sqm: (v) => (v === null || v === undefined || v === '' ? null : Number(v) * 10000),
  to_number: (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
};

function applyTransform(name, value) {
  if (!name) return value;
  const fn = TRANSFORMS[name];
  if (!fn) throw new Error(`Unknown transform "${name}" referenced in mapping profile`);
  return fn(value);
}

function applyMapping(rawRow, fieldMappings) {
  const mapped = {};
  const unmapped = {};
  const consumedKeys = new Set();

  for (const [sourceField, rule] of Object.entries(fieldMappings)) {
    // Case-insensitive lookup, since real-world CSV/Excel headers vary in casing.
    const matchKey = Object.keys(rawRow).find(
      (k) => k.toLowerCase() === sourceField.toLowerCase()
    );
    if (matchKey === undefined) continue;
    consumedKeys.add(matchKey);
    const rawValue = rawRow[matchKey];
    mapped[rule.target] = applyTransform(rule.transform, rawValue);
  }

  for (const key of Object.keys(rawRow)) {
    if (!consumedKeys.has(key)) unmapped[key] = rawRow[key];
  }

  return { mapped, unmapped };
}

module.exports = { applyMapping, applyTransform, TRANSFORMS };
