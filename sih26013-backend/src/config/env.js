require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'land_conflation',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '20', 10),
  conflation: {
    distanceMeters: parseFloat(process.env.CONFLATION_DISTANCE_METERS || '5'),
    areaMismatchThresholdPct: parseFloat(process.env.AREA_MISMATCH_THRESHOLD_PCT || '10'),
    geometryOverlapMinRatio: parseFloat(process.env.GEOMETRY_OVERLAP_MIN_RATIO || '0.6'),
  },
};
