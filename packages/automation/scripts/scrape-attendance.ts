import { chromium } from 'playwright';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';

export type PoliticianAttendance = {
  name: string;
  partySlug: string;
  attended: number;
  justifiedAbsent: number;
  unjustifiedAbsent: number;
  absent: number;
  percentage: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/~/g, '');
}

function generateCurrentMonthDates(): {from: string, to: string} {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return {
    from: formatDate(firstDay),
    to: formatDate(lastDay)
  }
}

function parsePercentage(percentageStr: string): number {
  return Number(percentageStr.trim().replace('%', '').replace(',', '.'));
}

export function getTodayFormatted(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

const ASISTENCIA_RESUMEN_URL = 'https://www.camara.cl/legislacion/sala_sesiones/asistencia_resumen.aspx';

async function scrapeAttendance() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const { from, to } = generateCurrentMonthDates();

  try {
    await page.goto(ASISTENCIA_RESUMEN_URL);

    // Wait for and fill the date input
    const dateFromSelector = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_desde';
    await page.waitForSelector(dateFromSelector, { timeout: 5000 });
    await page.fill(dateFromSelector, from);

    const dateToSelector = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_hasta';
    await page.waitForSelector(dateToSelector, { timeout: 5000 });
    await page.fill(dateToSelector, to);

    const searchButton = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_btnBuscar';
    

    console.log('searching for', from, to)

    await page.click(searchButton);

    const resultTable = '.tabla'
    await page.waitForSelector(resultTable, { timeout: 10000 });

    // Get page HTML and extract in Node.js (debugger can stop here)
    const html = await page.content();
    const $ = load(html);

    const parties = new Map<string, {party: string}>();

    type PoliticianAttendance = {
      name: string;
      partySlug: string;
      attended: number;
      justifiedAbsent: number;
      unjustifiedAbsent: number;
      absent: number;
      percentage: number;
    }

    const politicians = new Map<string, PoliticianAttendance>();

    // Extract data from first table - NOW IN NODE.JS CONTEXT
    const attendance = $('table.tabla').first().find('tbody > tr').map((_, row) => {
      const $row = $(row);
      const cells = $row.children('td');

      // Skip rows that don't have expected number of columns
      if (cells.length < 7) return null;

      let [
        nameCell,
        partyCell,
        attendedCell,
        justifiedAbsentCell,
        unjustifiedAbsentCell,
        absentCell,
        percentageCell
      ] = cells;

      let name = $(nameCell).text().trim();
      let nameSlug = slugify(name);
      let party = $(partyCell).text().trim();
      let partySlug = slugify(party);
      let attended = Number($(attendedCell).text().trim());
      let justifiedAbsent = Number($(justifiedAbsentCell).find('a span').text().trim());
      let unjustifiedAbsent = Number($(unjustifiedAbsentCell).find('a span').text().trim());
      let absent = Number($(absentCell).text().trim());
      let percentage = parsePercentage($(percentageCell).text().trim());


      if(!parties.has(partySlug)) {
        parties.set(partySlug, {party})
      }

      if(!politicians.has(nameSlug)) {
        politicians.set(nameSlug, {
          name,
          partySlug,
          attended,
          justifiedAbsent,
          unjustifiedAbsent,
          absent,
          percentage
        })
      }

      return {
        name,
        party,
        partySlug,
        attended,
        justifiedAbsent,
        unjustifiedAbsent,
        absent,
        percentage
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
    const attendancePath = path.join(tempDir, 'attendance.json');

    fs.writeFileSync(partiesPath, JSON.stringify(partiesArray, null, 2));
    console.log(`✓ Wrote ${partiesArray.length} parties to ./temp/parties.json`);
    console.log(`✓ Collected attendance for ${attendance.length} politicians`);

    const politiciansArray = Array.from(politicians, ([_, v]) => v);
    fs.writeFileSync(politiciansPath, JSON.stringify(politiciansArray, null, 2));
    console.log(`✓ Wrote ${politiciansArray.length} politicians to ./temp/politicians.json`);

    fs.writeFileSync(attendancePath, JSON.stringify(attendance, null, 2));
    console.log(`✓ Wrote ${attendancePath.length} attendance entries to ./temp/attendance.json`);

    console.log('\nNext steps:');
    console.log('  1. pnpm create-parties ./temp/parties.json');
    console.log('  2. pnpm create-politicians ./temp/politicians.json');
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAttendance().catch(console.error);
}
