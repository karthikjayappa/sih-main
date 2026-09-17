/* Minimal structured console logger (swap for pino/winston in production). */
function ts() { return new Date().toISOString(); }
module.exports = {
  info: (msg, meta) => console.log(`[INFO]  ${ts()} - ${msg}`, meta !== undefined ? meta : ''),
  warn: (msg, meta) => console.warn(`[WARN]  ${ts()} - ${msg}`, meta !== undefined ? meta : ''),
  error: (msg, meta) => console.error(`[ERROR] ${ts()} - ${msg}`, meta !== undefined ? meta : ''),
};
