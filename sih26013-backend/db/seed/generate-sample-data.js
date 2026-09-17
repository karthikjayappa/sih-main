/**
 * Generates 3 sample source datasets (different schemas) with INTENTIONAL,
 * documented conflicts so the conflation engine has something real to do:
 *
 *   Group A: same parcel_id (Revenue+Municipal), same geometry, DIFFERENT owner   -> OWNER_MISMATCH
 *   Group B: same parcel_id (Revenue+Municipal), same geometry, DIFFERENT area    -> AREA_MISMATCH
 *   Group C: different parcel_id (Revenue+Survey), geometry shifted ~3m, clean    -> merges via geometry only, no conflict
 *   Group D: different parcel_id (Revenue+Survey), geometry shifted ~3m, owner mismatch -> geometry match + OWNER_MISMATCH
 *   Group E: 3-way (Revenue+Municipal share ID; Survey geometry-linked), mixed conflicts
 *   Group F: Revenue-only parcels (single source, clean)
 *   Group G: Survey-only parcels (single source, clean)
 *   Group H: Municipal-only parcels (single source, clean)
 *   Group I: same parcel_id (Revenue+Municipal), Municipal geometry is much larger/shifted -> GEOMETRY_CONFLICT
 *
 * Output:
 *   db/seed/sample-data/revenue_dataset.csv
 *   db/seed/sample-data/survey_dataset.xlsx
 *   db/seed/sample-data/municipal_dataset.geojson
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OUT_DIR = path.join(__dirname, 'sample-data');
const ANCHOR = { lat: 19.9975, lon: 73.7898 }; // Ozar / Niphad, Nashik dist, Maharashtra
const M_PER_DEG_LAT = 111320;

function metersToDegLat(m) { return m / M_PER_DEG_LAT; }
function metersToDegLon(m, atLat) { return m / (M_PER_DEG_LAT * Math.cos((atLat * Math.PI) / 180)); }

// Places a logical parcel's centroid on a grid, spaced 80m apart so unrelated
// parcels never fall within the 5m conflation distance threshold by accident.
function gridCenter(index) {
  const cols = 6;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacingM = 80;
  return {
    lat: ANCHOR.lat + metersToDegLat(row * spacingM),
    lon: ANCHOR.lon + metersToDegLon(col * spacingM, ANCHOR.lat),
  };
}

// Small deterministic shift (default ~3m) used to simulate two agencies
// surveying "the same" boundary slightly differently (within the 5m threshold).
function shiftPoint(center, meters, bearingDeg) {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = metersToDegLat(meters * Math.cos(rad));
  const dLon = metersToDegLon(meters * Math.sin(rad), center.lat);
  return { lat: center.lat + dLat, lon: center.lon + dLon };
}

// Builds a square polygon ring (closed) around a center point.
function squareRing(center, halfSideMeters) {
  const dLat = metersToDegLat(halfSideMeters);
  const dLon = metersToDegLon(halfSideMeters, center.lat);
  const { lat, lon } = center;
  return [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ];
}

function ringToWkt(ring) {
  const coords = ring.map(([lon, lat]) => `${lon.toFixed(8)} ${lat.toFixed(8)}`).join(', ');
  return `POLYGON((${coords}))`;
}

function areaFromHalfSide(halfSideMeters) {
  return Math.round(halfSideMeters * 2 * (halfSideMeters * 2) * 100) / 100;
}

const FIRST_NAMES = ['Ramesh', 'Suresh', 'Anita', 'Kavita', 'Mahesh', 'Sunita', 'Vijay', 'Prakash', 'Geeta', 'Rajesh',
  'Meena', 'Sanjay', 'Deepak', 'Pooja', 'Ashok', 'Nirmala', 'Vinod', 'Shobha', 'Ravindra', 'Lata'];
const LAST_NAMES = ['Patil', 'Deshmukh', 'Jadhav', 'Kulkarni', 'More', 'Shinde', 'Gaikwad', 'Pawar', 'Chavan', 'Kale'];

let ownerCounter = 0;
function ownerName() {
  const n = `${FIRST_NAMES[ownerCounter % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(ownerCounter / FIRST_NAMES.length) % LAST_NAMES.length]}`;
  ownerCounter += 1;
  return n;
}

let khasraCounter = 100;
function nextKhasra() {
  khasraCounter += 1;
  return `${khasraCounter}/${(khasraCounter % 4) + 1}`;
}

const revenueRows = [];
const surveyRows = [];
const municipalFeatures = [];
let gridIndex = 0;
const auditNotes = [];

function addRevenue({ parcelId, owner, ownerId, areaSqm, center, halfSide, village = 'Ozar', tehsil = 'Niphad' }) {
  const areaAcre = Math.round((areaSqm / 4046.86) * 10000) / 10000;
  revenueRows.push({
    khasra_no: parcelId,
    owner,
    owner_aadhaar: ownerId,
    area_acre: areaAcre,
    village,
    tehsil,
    district: 'Nashik',
    state: 'Maharashtra',
    geometry_wkt: ringToWkt(squareRing(center, halfSide)),
    coordinate_system: 'WGS84',
  });
}

function addSurvey({ parcelId, owner, ownerId, areaSqm, center, village = 'Ozar', tehsil = 'Niphad' }) {
  const areaHa = Math.round((areaSqm / 10000) * 100000) / 100000;
  surveyRows.push({
    PlotID: parcelId,
    LandOwner: owner,
    OwnerAadhaar: ownerId,
    Area_Ha: areaHa,
    Village_Name: village,
    Taluk: tehsil,
    District: 'Nashik',
    State: 'Maharashtra',
    Lat: Number(center.lat.toFixed(8)),
    Lon: Number(center.lon.toFixed(8)),
    CoordSystem: 'WGS84',
  });
}

function addMunicipal({ parcelId, owner, ownerId, areaSqm, center, halfSide, village = 'Ozar', tehsil = 'Ward-3' }) {
  municipalFeatures.push({
    type: 'Feature',
    properties: {
      municipal_id: parcelId,
      resident_name: owner,
      resident_id: ownerId,
      plot_size_sqm: areaSqm,
      locality: village,
      ward: tehsil,
      city: 'Nashik',
      state: 'Maharashtra',
      crs: 'WGS84',
    },
    geometry: { type: 'Polygon', coordinates: [squareRing(center, halfSide)] },
  });
}

// ---- Group A: same ID (Revenue+Municipal), same geometry, DIFFERENT owner -> OWNER_MISMATCH ----
for (let i = 0; i < 5; i += 1) {
  const id = nextKhasra();
  const center = gridCenter(gridIndex++);
  const halfSide = 20;
  const areaSqm = areaFromHalfSide(halfSide);
  const ownerRev = ownerName();
  const ownerMun = ownerName(); // deliberately different
  addRevenue({ parcelId: id, owner: ownerRev, ownerId: `AAD${1000 + gridIndex}`, areaSqm, center, halfSide });
  addMunicipal({ parcelId: id, owner: ownerMun, ownerId: `MUN${1000 + gridIndex}`, areaSqm, center, halfSide });
  auditNotes.push(`Group A #${i + 1}: parcel_id=${id} expect OWNER_MISMATCH ("${ownerRev}" vs "${ownerMun}")`);
}

// ---- Group B: same ID, same geometry, DIFFERENT area (>10%) -> AREA_MISMATCH ----
for (let i = 0; i < 5; i += 1) {
  const id = nextKhasra();
  const center = gridCenter(gridIndex++);
  const halfSide = 18;
  const areaTrue = areaFromHalfSide(halfSide);
  const owner = ownerName();
  addRevenue({ parcelId: id, owner, ownerId: `AAD${2000 + gridIndex}`, areaSqm: areaTrue, center, halfSide });
  const areaMuniInflated = Math.round(areaTrue * 1.35 * 100) / 100; // +35% -> triggers >10% threshold
  addMunicipal({ parcelId: id, owner, ownerId: `MUN${2000 + gridIndex}`, areaSqm: areaMuniInflated, center, halfSide });
  auditNotes.push(`Group B #${i + 1}: parcel_id=${id} expect AREA_MISMATCH (${areaTrue} sqm vs ${areaMuniInflated} sqm)`);
}

// ---- Group C: different IDs (Revenue+Survey), geometry shifted ~3m, clean merge ----
for (let i = 0; i < 5; i += 1) {
  const revId = nextKhasra();
  const surveyId = `SVY-${2000 + gridIndex}`;
  const center = gridCenter(gridIndex++);
  const halfSide = 15;
  const areaSqm = areaFromHalfSide(halfSide);
  const owner = ownerName();
  const ownerId = `AAD${3000 + gridIndex}`;
  addRevenue({ parcelId: revId, owner, ownerId, areaSqm, center, halfSide });
  const shifted = shiftPoint(center, 3, 40 * i); // ~3m shift, within 5m threshold
  addSurvey({ parcelId: surveyId, owner, ownerId, areaSqm, center: shifted });
  auditNotes.push(`Group C #${i + 1}: revenue=${revId} / survey=${surveyId}, ~3m apart, expect CLEAN geometry-based merge`);
}

// ---- Group D: different IDs (Revenue+Survey), geometry shifted ~3m, owner mismatch ----
for (let i = 0; i < 4; i += 1) {
  const revId = nextKhasra();
  const surveyId = `SVY-${3000 + gridIndex}`;
  const center = gridCenter(gridIndex++);
  const halfSide = 16;
  const areaSqm = areaFromHalfSide(halfSide);
  const ownerRev = ownerName();
  const ownerSvy = ownerName();
  addRevenue({ parcelId: revId, owner: ownerRev, ownerId: `AAD${4000 + gridIndex}`, areaSqm, center, halfSide });
  const shifted = shiftPoint(center, 3.5, 90 + 30 * i);
  addSurvey({ parcelId: surveyId, owner: ownerSvy, ownerId: `SVYOWN${4000 + gridIndex}`, areaSqm, center: shifted });
  auditNotes.push(`Group D #${i + 1}: revenue=${revId} / survey=${surveyId}, geometry-linked, expect OWNER_MISMATCH`);
}

// ---- Group E: 3-way merge (Revenue+Municipal share ID; Survey geometry-linked), mixed conflicts ----
for (let i = 0; i < 3; i += 1) {
  const id = nextKhasra();
  const surveyId = `SVY-${4000 + gridIndex}`;
  const center = gridCenter(gridIndex++);
  const halfSide = 17;
  const areaSqm = areaFromHalfSide(halfSide);
  const owner = ownerName();
  const ownerId = `AAD${5000 + gridIndex}`;
  addRevenue({ parcelId: id, owner, ownerId, areaSqm, center, halfSide });
  addMunicipal({ parcelId: id, owner, ownerId: `MUN${5000 + gridIndex}`, areaSqm: Math.round(areaSqm * 1.2 * 100) / 100, center, halfSide });
  const shifted = shiftPoint(center, 2.5, 200 + i * 10);
  addSurvey({ parcelId: surveyId, owner: ownerName(), ownerId: `SVYOWN${5000 + gridIndex}`, areaSqm, center: shifted });
  auditNotes.push(`Group E #${i + 1}: revenue+municipal id=${id} + survey=${surveyId} -> 3-way merge, AREA_MISMATCH + OWNER_MISMATCH expected`);
}

// ---- Group F: Revenue-only (single source, clean) ----
for (let i = 0; i < 8; i += 1) {
  const id = nextKhasra();
  const center = gridCenter(gridIndex++);
  const halfSide = 14 + i;
  addRevenue({ parcelId: id, owner: ownerName(), ownerId: `AAD${6000 + gridIndex}`, areaSqm: areaFromHalfSide(halfSide), center, halfSide });
}

// ---- Group G: Survey-only (single source, clean) ----
for (let i = 0; i < 8; i += 1) {
  const id = `SVY-${6000 + gridIndex}`;
  const center = gridCenter(gridIndex++);
  addSurvey({ parcelId: id, owner: ownerName(), ownerId: `SVYOWN${6000 + gridIndex}`, areaSqm: 900 + i * 40, center });
}

// ---- Group H: Municipal-only (single source, clean) ----
for (let i = 0; i < 6; i += 1) {
  const id = `MUN-${7000 + gridIndex}`;
  const center = gridCenter(gridIndex++);
  const halfSide = 12 + i;
  addMunicipal({ parcelId: id, owner: ownerName(), ownerId: `MUN${7000 + gridIndex}`, areaSqm: areaFromHalfSide(halfSide), center, halfSide, tehsil: 'Ward-5' });
}

// ---- Group I: same ID (Revenue+Municipal), Municipal geometry much larger & offset -> GEOMETRY_CONFLICT ----
for (let i = 0; i < 4; i += 1) {
  const id = nextKhasra();
  const center = gridCenter(gridIndex++);
  const halfSide = 15;
  const areaSqm = areaFromHalfSide(halfSide);
  const owner = ownerName();
  addRevenue({ parcelId: id, owner, ownerId: `AAD${8000 + gridIndex}`, areaSqm, center, halfSide });
  const bigCenter = shiftPoint(center, 12, 45 * i); // 12m offset, well beyond a tidy overlap
  const bigHalfSide = halfSide * 2.2; // much bigger footprint
  addMunicipal({ parcelId: id, owner, ownerId: `MUN${8000 + gridIndex}`, areaSqm: areaFromHalfSide(bigHalfSide), center: bigCenter, halfSide: bigHalfSide });
  auditNotes.push(`Group I #${i + 1}: parcel_id=${id} expect GEOMETRY_CONFLICT (municipal footprint much larger & offset)`);
}

// ---------- Write revenue_dataset.csv ----------
const csvHeader = ['khasra_no', 'owner', 'owner_aadhaar', 'area_acre', 'village', 'tehsil', 'district', 'state', 'geometry_wkt', 'coordinate_system'];
const csvLines = [csvHeader.join(',')];
for (const r of revenueRows) {
  csvLines.push(csvHeader.map((h) => {
    const v = String(r[h]).replace(/"/g, '""');
    return v.includes(',') ? `"${v}"` : v;
  }).join(','));
}
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'revenue_dataset.csv'), csvLines.join('\n'));

// ---------- Write survey_dataset.xlsx ----------
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(surveyRows);
XLSX.utils.book_append_sheet(wb, ws, 'Plots');
XLSX.writeFile(wb, path.join(OUT_DIR, 'survey_dataset.xlsx'));

// ---------- Write municipal_dataset.geojson ----------
const geojson = { type: 'FeatureCollection', features: municipalFeatures };
fs.writeFileSync(path.join(OUT_DIR, 'municipal_dataset.geojson'), JSON.stringify(geojson, null, 2));

// ---------- Write a human-readable README describing the intentional conflicts ----------
fs.writeFileSync(
  path.join(OUT_DIR, 'EXPECTED_CONFLICTS.md'),
  `# Expected conflation outcomes for this sample data\n\n` +
  `Total source rows: revenue=${revenueRows.length}, survey=${surveyRows.length}, municipal=${municipalFeatures.length} ` +
  `(grand total ${revenueRows.length + surveyRows.length + municipalFeatures.length})\n\n` +
  auditNotes.map((n) => `- ${n}`).join('\n') + '\n'
);

console.log(`Generated ${revenueRows.length} revenue rows, ${surveyRows.length} survey rows, ${municipalFeatures.length} municipal features.`);
console.log(`Files written to ${OUT_DIR}`);
