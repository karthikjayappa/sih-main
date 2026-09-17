const turf = require('@turf/turf');

/**
 * Builds a small square polygon (approximating a parcel footprint) around a
 * centroid point. Used when a source only reports lat/lon (e.g. a survey
 * point register) rather than a full boundary polygon.
 */
function pointToSquarePolygon(lat, lon, halfSideMeters = 15) {
  const center = turf.point([lon, lat]);
  const north = turf.destination(center, halfSideMeters / 1000, 0, { units: 'kilometers' });
  const east = turf.destination(center, halfSideMeters / 1000, 90, { units: 'kilometers' });
  const south = turf.destination(center, halfSideMeters / 1000, 180, { units: 'kilometers' });
  const west = turf.destination(center, halfSideMeters / 1000, -90, { units: 'kilometers' });

  const eastLon = east.geometry.coordinates[0];
  const westLon = west.geometry.coordinates[0];
  const northLat = north.geometry.coordinates[1];
  const southLat = south.geometry.coordinates[1];

  const ring = [
    [westLon, southLat],
    [eastLon, southLat],
    [eastLon, northLat],
    [westLon, northLat],
    [westLon, southLat],
  ];
  return { type: 'Polygon', coordinates: [ring] };
}

module.exports = { pointToSquarePolygon };
