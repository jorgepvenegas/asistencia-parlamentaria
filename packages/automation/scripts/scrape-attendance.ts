import { chromium } from 'playwright';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/~/g, '');
}

async function scrapeAttendance() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.camara.cl/legislacion/sala_sesiones/asistencia_resumen.aspx');

    // Wait for and fill the date input
    const dateFrom = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_desde';
    await page.waitForSelector(dateFrom, { timeout: 5000 });
    await page.fill(dateFrom, '01/01/2026');

    const dateTo = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_hasta';
    await page.waitForSelector(dateTo, { timeout: 5000 });
    await page.fill(dateTo, '31/12/2026');

    const searchButton = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_btnBuscar';
    
    await page.click(searchButton);

    const resultTable = '.tabla'
    await page.waitForSelector(resultTable, { timeout: 10000 });

    // Get page HTML and extract in Node.js (debugger can stop here)
    const html = await page.content();
    const $ = load(html);

    const parties = new Map<string, {party: string}>();
    const politicians = new Map<string, {name: string, partySlug: string}>();

    // Extract data from first table - NOW IN NODE.JS CONTEXT
    const tableData = $('table.tabla').first().find('tbody > tr').map((_, row) => {
      const $row = $(row);
      const cells = $row.find('td');

      // Skip rows that don't have expected number of columns
      if (cells.length < 7) return null;

      let [nameCell, partyCell, attendanceCountCell, nonAffectAttendanceCountCell, affectAttendanceCountCell, nonJustificationCountCell, attendanceAverageCell] = cells;

      let name = $(nameCell).text().trim();
      let nameSlug = slugify(name);
      let party = $(partyCell).text().trim();
      let partySlug = slugify(party);
      let attendanceCount = $(attendanceCountCell).text().trim();
      let nonAffectAttendanceCount = $(nonAffectAttendanceCountCell).find('a span').text().trim();
      let affectAttendanceCount = $(affectAttendanceCountCell).find('a span').text().trim();
      let nonJustificationCount = $(nonJustificationCountCell).text().trim();
      let attendanceAverage = $(attendanceAverageCell).text().trim();


      if(!parties.has(partySlug)) {
        parties.set(partySlug, {party})
      }

      if(!politicians.has(nameSlug)) {
        politicians.set(nameSlug, {
          name,
          partySlug
        })
      }

      return {
        name,
        party,
        partySlug,
        attendanceCount,
        nonAffectAttendanceCount,
        affectAttendanceCount,
        nonJustificationCount,
        attendanceAverage
      };
    }).get().filter(item => item !== null);

    const partiesArray = Array.from(parties, ([k, v]) => ({
      slug: k,
      party: v.party
    }));

    // Write to ./temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    fs.mkdirSync(tempDir, { recursive: true });

    const partiesPath = path.join(tempDir, 'parties.json');
    const politiciansPath = path.join(tempDir, 'politicians.json');
    const screenshotPath = path.join(tempDir, 'chamber-table.png');

    fs.writeFileSync(partiesPath, JSON.stringify(partiesArray, null, 2));
    console.log(`✓ Wrote ${partiesArray.length} parties to ./temp/parties.json`);
    console.log(`✓ Collected ${tableData.length} politicians`);

    const politiciansArray = Array.from(politicians, ([_, v]) => v);
    fs.writeFileSync(politiciansPath, JSON.stringify(politiciansArray, null, 2));
    console.log(`✓ Wrote ${politiciansArray.length} politicians to ./temp/politicians.json`);

    console.log('\nNext steps:');
    console.log('  1. pnpm create-parties ./temp/parties.json');
    console.log('  2. pnpm create-politicians ./temp/politicians.json');

    // Take screenshot
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ./temp/chamber-table.png`);
  } finally {
    await browser.close();
  }
}

scrapeAttendance().catch(console.error);
