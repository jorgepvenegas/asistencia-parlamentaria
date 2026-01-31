/**
 * Main orchestration pipeline for complete data sync flow.
 * Coordinates scraping, party creation, and politician creation.
 * Returns typed result with detailed error information.
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import type { SyncResult } from '../types.js';
import { scrapeAndWriteFiles } from '../scrapers/attendance.js';
import { createPartiesFromFile } from '../api-clients/parties.js';
import { createPoliticiansFromFile, createPoliticiansFromFileYearly } from '../api-clients/politicians.js';
import { getYearDateRange } from '../utils/dates.js';

/**
 * Execute full synchronization pipeline:
 * 1. Scrape chamber attendance data
 * 2. Create parties from scraped data
 * 3. Create politicians and attendance records
 * 4. Clean up temporary files
 * 5. Return typed result with detailed metrics
 */
export async function syncData(): Promise<SyncResult> {
  const startTime = new Date().toISOString();
  const startMs = Date.now();

  const result: SyncResult = {
    success: false,
    startTime,
    endTime: '',
    duration: 0,
    steps: {
      scraping: {
        success: false,
        partiesCount: 0,
        politiciansCount: 0,
        attendanceCount: 0,
      },
      partyCreation: {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [],
      },
      politicianCreation: {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [],
      },
    },
  };

  try {
    // Step 1: Scraping
    // eslint-disable-next-line no-console
    console.log('📡 Step 1: Scraping chamber data...\n');
    const { partiesPath, politiciansPath, attendancePath } = await scrapeAndWriteFiles();

    result.steps.scraping.success = true;
    // Count scraped items
    const partiesData = JSON.parse(fs.readFileSync(partiesPath, 'utf-8')) as { length: number };
    const politiciansData = JSON.parse(fs.readFileSync(politiciansPath, 'utf-8')) as {
      length: number;
    };
    const attendanceData = JSON.parse(fs.readFileSync(attendancePath, 'utf-8')) as {
      length: number;
    };

    result.steps.scraping.partiesCount = partiesData.length;
    result.steps.scraping.politiciansCount = politiciansData.length;
    result.steps.scraping.attendanceCount = attendanceData.length;

    // Step 2: Create parties
    // eslint-disable-next-line no-console
    console.log('\n\n✅ Step 2: Creating parties...\n');
    const partyResult = await createPartiesFromFile(partiesPath);
    result.steps.partyCreation.success = partyResult.success;
    result.steps.partyCreation.successCount = partyResult.successCount;
    result.steps.partyCreation.failureCount = partyResult.failureCount;
    result.steps.partyCreation.errors = partyResult.errors;

    // Step 3: Create politicians and attendance
    // eslint-disable-next-line no-console
    console.log('\n\n✅ Step 3: Creating politicians and attendance...\n');
    const politicianResult = await createPoliticiansFromFile(politiciansPath);
    result.steps.politicianCreation.success = politicianResult.success;
    result.steps.politicianCreation.successCount = politicianResult.successCount;
    result.steps.politicianCreation.failureCount = politicianResult.failureCount;
    result.steps.politicianCreation.errors = politicianResult.errors;

    // Step 4: Clean up temp files
    // eslint-disable-next-line no-console
    console.log('\n\n🧹 Step 4: Cleaning up temp files...');
    const tempDir = path.join(process.cwd(), config.paths.tempDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
    // eslint-disable-next-line no-console
    console.log(`✓ Deleted ${config.paths.tempDir} directory`);

    // Mark overall success only if all steps succeeded
    result.success =
      result.steps.scraping.success &&
      result.steps.partyCreation.success &&
      result.steps.politicianCreation.success;

    // eslint-disable-next-line no-console
    console.log('\n\n✨ All done! Data synced successfully.');

    /* TODO: monitoring hook for Slack/email alert on success */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Error during sync:', error);

    result.success = false;

    /* TODO: monitoring hook for Slack/email alert on error */
    throw error;
  } finally {
    result.endTime = new Date().toISOString();
    result.duration = Date.now() - startMs;
  }

  return result;
}

/**
 * Execute full synchronization pipeline for a specific year:
 * 1. Scrape chamber attendance data for the full year
 * 2. Create parties from scraped data
 * 3. Create politicians and yearly attendance records
 * 4. Clean up temporary files
 * 5. Return typed result with detailed metrics
 */
export async function syncDataYearly(year: number): Promise<SyncResult> {
  const startTime = new Date().toISOString();
  const startMs = Date.now();

  const result: SyncResult = {
    success: false,
    startTime,
    endTime: '',
    duration: 0,
    steps: {
      scraping: {
        success: false,
        partiesCount: 0,
        politiciansCount: 0,
        attendanceCount: 0,
      },
      partyCreation: {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [],
      },
      politicianCreation: {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [],
      },
    },
  };

  try {
    // Step 1: Scraping for full year
    const dateRange = getYearDateRange(year);
    // eslint-disable-next-line no-console
    console.log(`📡 Step 1: Scraping chamber data for ${year}...\n`);
    const { partiesPath, politiciansPath, attendancePath } = await scrapeAndWriteFiles(dateRange);

    result.steps.scraping.success = true;
    const partiesData = JSON.parse(fs.readFileSync(partiesPath, 'utf-8')) as { length: number };
    const politiciansData = JSON.parse(fs.readFileSync(politiciansPath, 'utf-8')) as {
      length: number;
    };
    const attendanceData = JSON.parse(fs.readFileSync(attendancePath, 'utf-8')) as {
      length: number;
    };

    result.steps.scraping.partiesCount = partiesData.length;
    result.steps.scraping.politiciansCount = politiciansData.length;
    result.steps.scraping.attendanceCount = attendanceData.length;

    // Step 2: Create parties
    // eslint-disable-next-line no-console
    console.log('\n\n✅ Step 2: Creating parties...\n');
    const partyResult = await createPartiesFromFile(partiesPath);
    result.steps.partyCreation.success = partyResult.success;
    result.steps.partyCreation.successCount = partyResult.successCount;
    result.steps.partyCreation.failureCount = partyResult.failureCount;
    result.steps.partyCreation.errors = partyResult.errors;

    // Step 3: Create politicians and yearly attendance
    // eslint-disable-next-line no-console
    console.log('\n\n✅ Step 3: Creating politicians and yearly attendance...\n');
    const politicianResult = await createPoliticiansFromFileYearly(politiciansPath, year);
    result.steps.politicianCreation.success = politicianResult.success;
    result.steps.politicianCreation.successCount = politicianResult.successCount;
    result.steps.politicianCreation.failureCount = politicianResult.failureCount;
    result.steps.politicianCreation.errors = politicianResult.errors;

    // Step 4: Clean up temp files
    // eslint-disable-next-line no-console
    console.log('\n\n🧹 Step 4: Cleaning up temp files...');
    const tempDir = path.join(process.cwd(), config.paths.tempDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
    // eslint-disable-next-line no-console
    console.log(`✓ Deleted ${config.paths.tempDir} directory`);

    result.success =
      result.steps.scraping.success &&
      result.steps.partyCreation.success &&
      result.steps.politicianCreation.success;

    // eslint-disable-next-line no-console
    console.log(`\n\n✨ All done! Data synced successfully for ${year}.`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Error during sync:', error);

    result.success = false;

    throw error;
  } finally {
    result.endTime = new Date().toISOString();
    result.duration = Date.now() - startMs;
  }

  return result;
}
