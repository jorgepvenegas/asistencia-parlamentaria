/**
 * Politician and attendance creation API client.
 */

import { client } from '@quienatiende/shared';
import fs from 'fs';
import type { PoliticianAttendance } from '../types.js';
import { config } from '../config.js';
import { withDelay } from '../utils/http.js';
import { getTodayFormatted } from '../utils/dates.js';

export interface PoliticianResult {
  success: boolean;
  successCount: number;
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
    console.log(`Creating ${politicians.length} politicians...`);

    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ name: string; error: string }> = [];

    // Fetch existing politicians to skip duplicates
    const politiciansRequest = await client.api.politicians.$get();

    if (!politiciansRequest.ok) {
      console.error('Failed to fetch existing politicians:', politiciansRequest.statusText);
      throw new Error('Failed to fetch existing politicians');
    }

    const existingPoliticiansData = await politiciansRequest.json();

    for (const { name, partySlug, attended, percentage } of politicians) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        let match = existingPoliticiansData.data.find((epd) => epd.name === name);

        // Create politician if doesn't exist
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
          // eslint-disable-next-line no-await-in-loop
          await withDelay(config.delays.politicianCreate);
        }

        // Create attendance record
        const attendanceResponse = await client.api.attendance.$post({
          json: {
            attendanceAverage: percentage,
            attendanceCount: attended,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            politicianId: match.id,
            date: getTodayFormatted(),
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

        successCount++;
        process.stdout.write('.');
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

    // eslint-disable-next-line no-console
    console.log(`\n\n✓ Successfully created ${successCount} politicians`);

    if (failureCount > 0) {
      // eslint-disable-next-line no-console
      console.error(`✗ Failed to create ${failureCount} politicians:`);
      errors.slice(0, 10).forEach(({ name, error }) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${name}: ${error}`);
      });
      if (errors.length > 10) {
        // eslint-disable-next-line no-console
        console.error(`  ... and ${errors.length - 10} more`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('All politicians created successfully!');
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Error creating politicians:', error);
    throw error;
  }
}
