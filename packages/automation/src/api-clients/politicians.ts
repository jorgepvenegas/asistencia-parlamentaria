/**
 * Politician and attendance creation API client.
 */

import { client } from '@quienatiende/shared';
import fs from 'fs';
import type { PoliticianAttendance } from '../types.js';
import { config } from '../config.js';
import { withDelay } from '../utils/http.js';
import { getCurrentYearMonth } from '../utils/dates.js';

type ExistingPolitician = { id: number; name: string };

export interface PoliticianResult {
  success: boolean;
  createdCount: number;
  foundCount: number;
  failureCount: number;
  errors: Array<{ name: string; error: string }>;
}

/**
 * Create politicians and their attendance records from JSON file via API.
 * Fetches existing politicians to avoid duplicates.
 * Creates politician if needed, then creates attendance record.
 */
export async function createPoliticiansFromFile(filePath: string): Promise<PoliticianResult> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const politicians: PoliticianAttendance[] = JSON.parse(fileContent) as PoliticianAttendance[];

    // eslint-disable-next-line no-console
    console.log(`Processing ${politicians.length} politicians...`);

    let createdCount = 0;
    let foundCount = 0;
    let failureCount = 0;
    const errors: Array<{ name: string; error: string }> = [];

    // Fetch existing politicians to skip duplicates
    const politiciansRequest = await client.api.politicians.$get();

    if (!politiciansRequest.ok) {
      console.error('Failed to fetch existing politicians:', politiciansRequest.statusText);
      throw new Error('Failed to fetch existing politicians');
    }

    const existingPoliticiansData = await politiciansRequest.json();

    for (const { name, partySlug, attended, percentage, absent, justifiedAbsent, unjustifiedAbsent } of politicians) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        let match = existingPoliticiansData.data.find((epd) => epd.name === name);

        // Create politician if doesn't exist
        let isNewPolitician = false;
        if (!match) {
          const createResponse = await client.api.politicians.$post({
            json: {
              name,
              partySlug,
            },
          });
          const createData = await createResponse.json();
          if ('error' in createData) {
            throw new Error(String(createData.error));
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          match = createData.data;
          isNewPolitician = true;
          // eslint-disable-next-line no-await-in-loop
          await withDelay(config.delays.politicianCreate);
        }

        // Create attendance record
        const { year, month } = getCurrentYearMonth();
        const attendanceResponse = await client.api.attendance.monthly.$post({
          json: {
            attendanceAverage: percentage,
            attendanceCount: attended,
            absentCount: absent,
            justifiedAbsentCount: justifiedAbsent,
            unjustifiedAbsentCount: unjustifiedAbsent,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            politicianId: match.id,
            year,
            month,
          },
        });

        if (!attendanceResponse.ok) {
          const errorData = await attendanceResponse.json();
          // eslint-disable-next-line no-console
          console.error(
            `\nError creating attendance for ${name}:`,
            attendanceResponse.status,
            errorData
          );
        }

        if (isNewPolitician) {
          createdCount++;
          process.stdout.write('+');
        } else {
          foundCount++;
          process.stdout.write('.');
        }
      } catch (error) {
        failureCount++;
        errors.push({
          name,
          error: String(error),
        });
        process.stdout.write('X');
      }

      // eslint-disable-next-line no-await-in-loop
      await withDelay(config.delays.politicianCreate);
    }

    const total = createdCount + foundCount;
    // eslint-disable-next-line no-console
    console.log(`\n\n✓ Processed ${total}: ${createdCount} created, ${foundCount} found`);

    if (failureCount > 0) {
      // eslint-disable-next-line no-console
      console.error(`✗ Failed to process ${failureCount} politicians:`);
      errors.slice(0, 10).forEach(({ name, error }) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${name}: ${error}`);
      });
      if (errors.length > 10) {
        // eslint-disable-next-line no-console
        console.error(`  ... and ${errors.length - 10} more`);
      }
    }

    return {
      success: failureCount === 0,
      createdCount,
      foundCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Error creating politicians:', error);
    throw error;
  }
}

/**
 * Create politicians and their yearly attendance records from JSON file via API.
 */
export async function createPoliticiansFromFileYearly(
  filePath: string,
  year: number
): Promise<PoliticianResult> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const politicians: PoliticianAttendance[] = JSON.parse(fileContent) as PoliticianAttendance[];

    // eslint-disable-next-line no-console
    console.log(`Processing ${politicians.length} politicians (yearly)...`);

    let createdCount = 0;
    let foundCount = 0;
    let failureCount = 0;
    const errors: Array<{ name: string; error: string }> = [];

    const politiciansRequest = await client.api.politicians.$get();

    if (!politiciansRequest.ok) {
      console.error('Failed to fetch existing politicians:', politiciansRequest.statusText);
      throw new Error('Failed to fetch existing politicians');
    }

    const existingPoliticiansData = (await politiciansRequest.json()) as {
      data: ExistingPolitician[];
    };

    for (const {
      name,
      partySlug,
      attended,
      percentage,
      absent,
      justifiedAbsent,
      unjustifiedAbsent,
    } of politicians) {
      try {
        let match = existingPoliticiansData.data.find((epd) => epd.name === name);

        let isNewPolitician = false;
        if (!match) {
          const createResponse = await client.api.politicians.$post({
            json: { name, partySlug },
          });
          const createData = (await createResponse.json()) as
            | { data: ExistingPolitician }
            | { error: string };
          if ('error' in createData) {
            throw new Error(String(createData.error));
          }
          match = createData.data;
          isNewPolitician = true;
          // eslint-disable-next-line no-await-in-loop
          await withDelay(config.delays.politicianCreate);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const attendanceResponse = await client.api.attendance.yearly.$post({
          json: {
            attendanceAverage: percentage,
            attendanceCount: attended,
            absentCount: absent,
            justifiedAbsentCount: justifiedAbsent,
            unjustifiedAbsentCount: unjustifiedAbsent,
            politicianId: match.id,
            year,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!attendanceResponse.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const errorData = await attendanceResponse.json();
          // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
          console.error(
            `\nError creating yearly attendance for ${name}:`,
            attendanceResponse.status,
            errorData
          );
        }

        if (isNewPolitician) {
          createdCount++;
          process.stdout.write('+');
        } else {
          foundCount++;
          process.stdout.write('.');
        }
      } catch (error) {
        failureCount++;
        errors.push({ name, error: String(error) });
        process.stdout.write('X');
      }

      // eslint-disable-next-line no-await-in-loop
      await withDelay(config.delays.politicianCreate);
    }

    const total = createdCount + foundCount;
    // eslint-disable-next-line no-console
    console.log(`\n\n✓ Processed ${total} (yearly): ${createdCount} created, ${foundCount} found`);

    if (failureCount > 0) {
      // eslint-disable-next-line no-console
      console.error(`✗ Failed to process ${failureCount} politicians:`);
      errors.slice(0, 10).forEach(({ name, error }) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${name}: ${error}`);
      });
      if (errors.length > 10) {
        // eslint-disable-next-line no-console
        console.error(`  ... and ${errors.length - 10} more`);
      }
    }

    return {
      success: failureCount === 0,
      createdCount,
      foundCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Error creating politicians (yearly):', error);
    throw error;
  }
}
