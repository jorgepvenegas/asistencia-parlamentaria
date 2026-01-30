/**
 * Playwright-based web scraper for Chamber attendance data.
 */

import { chromium } from 'playwright';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import type { PoliticianAttendance, PartyData } from '../types.js';
import { generateCurrentMonthDates } from '../utils/dates.js';
import { slugify } from '../utils/slugs.js';
import { parsePercentage } from '../utils/parse.js';

export interface ScrapingResult {
  parties: PartyData[];
  politicians: PoliticianAttendance[];
  attendance: Array<{
    name: string;
    party: string;
    partySlug: string;
    attended: number;
    justifiedAbsent: number;
    unjustifiedAbsent: number;
    absent: number;
    percentage: number;
  }>;
}

/**
 * Scrape attendance data from chamber website and return parsed data.
 */
export async function scrapeAttendance(): Promise<ScrapingResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const { from, to } = generateCurrentMonthDates();

  try {
    await page.goto(config.urls.chamberAttendance);

    // Fill date inputs
    await page.waitForSelector(config.selectors.dateFromInput, {
      timeout: config.timeouts.selectorWait,
    });
    await page.fill(config.selectors.dateFromInput, from);

    await page.waitForSelector(config.selectors.dateToInput, {
      timeout: config.timeouts.selectorWait,
    });
    await page.fill(config.selectors.dateToInput, to);

    // eslint-disable-next-line no-console
    console.log('searching for', from, to);

    await page.click(config.selectors.searchButton);

    await page.waitForSelector(config.selectors.resultTable, {
      timeout: config.timeouts.tableWait,
    });

    // Extract HTML and parse with cheerio
    const html = await page.content();
    const $ = load(html);

    const parties = new Map<string, { party: string }>();
    const politicians = new Map<string, PoliticianAttendance>();

    // Extract data from table
    const attendance = $('table.tabla')
      .first()
      .find('tbody > tr')
      .map((_, row) => {
        const $row = $(row);
        const cells = $row.children('td');

        // Skip rows without expected columns
        if (cells.length < 7) {
          return null;
        }

        const [
          nameCell,
          partyCell,
          attendedCell,
          justifiedAbsentCell,
          unjustifiedAbsentCell,
          absentCell,
          percentageCell,
        ] = cells;

        const name = $(nameCell).text().trim();
        const nameSlug = slugify(name);
        const party = $(partyCell).text().trim();
        const partySlug = slugify(party);
        const attended = Number($(attendedCell).text().trim());
        const justifiedAbsent = Number($(justifiedAbsentCell).find('a span').text().trim());
        const unjustifiedAbsent = Number(
          $(unjustifiedAbsentCell).find('a span').text().trim()
        );
        const absent = Number($(absentCell).text().trim());
        const percentage = parsePercentage($(percentageCell).text().trim());

        if (!parties.has(partySlug)) {
          parties.set(partySlug, { party });
        }

        if (!politicians.has(nameSlug)) {
          politicians.set(nameSlug, {
            name,
            partySlug,
            attended,
            justifiedAbsent,
            unjustifiedAbsent,
            absent,
            percentage,
          });
        }

        return {
          name,
          party,
          partySlug,
          attended,
          justifiedAbsent,
          unjustifiedAbsent,
          absent,
          percentage,
        };
      })
      .get()
      .filter((item) => item !== null);

    const partiesArray = Array.from(parties, ([k, v]) => ({
      slug: k,
      party: v.party,
    }));

    const politiciansArray = Array.from(politicians, ([_, v]) => v);

    return {
      parties: partiesArray,
      politicians: politiciansArray,
      attendance,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Scrape attendance and write results to temp JSON files.
 * Returns file paths for parties and politicians.
 */
export async function scrapeAndWriteFiles(): Promise<{
  partiesPath: string;
  politiciansPath: string;
  attendancePath: string;
}> {
  const result = await scrapeAttendance();

  const tempDir = path.join(process.cwd(), config.paths.tempDir);
  fs.mkdirSync(tempDir, { recursive: true });

  const partiesPath = path.join(tempDir, config.paths.partiesFile);
  const politiciansPath = path.join(tempDir, config.paths.politiciansFile);
  const attendancePath = path.join(tempDir, config.paths.attendanceFile);

  fs.writeFileSync(partiesPath, JSON.stringify(result.parties, null, 2));
  // eslint-disable-next-line no-console
  console.log(`✓ Wrote ${result.parties.length} parties to ${config.paths.tempDir}/${config.paths.partiesFile}`);

  fs.writeFileSync(politiciansPath, JSON.stringify(result.politicians, null, 2));
  // eslint-disable-next-line no-console
  console.log(`✓ Wrote ${result.politicians.length} politicians to ${config.paths.tempDir}/${config.paths.politiciansFile}`);

  fs.writeFileSync(attendancePath, JSON.stringify(result.attendance, null, 2));
  // eslint-disable-next-line no-console
  console.log(`✓ Wrote ${result.attendance.length} attendance entries to ${config.paths.tempDir}/${config.paths.attendanceFile}`);

  return {
    partiesPath,
    politiciansPath,
    attendancePath,
  };
}
