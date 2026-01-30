/**
 * Centralized configuration for automation package.
 * All hardcoded values, selectors, timeouts, delays, and paths.
 */

export const config = {
  // URLs
  urls: {
    chamberAttendance:
      'https://www.camara.cl/legislacion/sala_sesiones/asistencia_resumen.aspx',
  },

  // CSS Selectors for Playwright scraping
  selectors: {
    dateFromInput: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_desde',
    dateToInput: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_hasta',
    searchButton: '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_btnBuscar',
    resultTable: '.tabla',
  },

  // Timeouts in milliseconds
  timeouts: {
    selectorWait: 5000,      // 5 seconds for selector visibility
    tableWait: 10000,        // 10 seconds for results table
    pageLoad: 30000,         // 30 seconds for page load
  },

  // Request delays in milliseconds
  delays: {
    partyCreate: 50,         // 50ms between party creation requests
    politicianCreate: 100,   // 100ms between politician/attendance requests
  },

  // File paths
  paths: {
    tempDir: './temp',
    partiesFile: 'parties.json',
    politiciansFile: 'politicians.json',
    attendanceFile: 'attendance.json',
  },

  // Environment variable keys
  env: {
    dryRun: 'DRY_RUN',
    verbose: 'VERBOSE',
  },
};
