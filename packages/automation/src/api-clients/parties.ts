/**
 * Party creation API client.
 */

import { client } from '@quienatiende/shared';
import fs from 'fs';
import type { PartyData } from '../types.js';
import { config } from '../config.js';
import { withDelay } from '../utils/http.js';

export interface PartyResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{ slug: string; error: string }>;
}

/**
 * Create parties from JSON file via API.
 * Processes sequentially with delay between requests.
 */
export async function createPartiesFromFile(filePath: string): Promise<PartyResult> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parties: PartyData[] = JSON.parse(fileContent) as PartyData[];

    // eslint-disable-next-line no-console
    console.log(`Creating ${parties.length} parties...`);

    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const { slug, party } of parties) {
      try {
        await client.api.parties.$post({
          json: {
            abbreviation: party,
            name: party,
            slug,
          },
        });
        successCount++;
        process.stdout.write('.');
      } catch (error) {
        failureCount++;
        errors.push({
          slug,
          error: String(error),
        });
        process.stdout.write('X');
      }

      // eslint-disable-next-line no-await-in-loop
      await withDelay(config.delays.partyCreate);
    }

    // eslint-disable-next-line no-console
    console.log(`\n\n✓ Successfully created ${successCount} parties`);

    if (failureCount > 0) {
      // eslint-disable-next-line no-console
      console.error(`✗ Failed to create ${failureCount} parties:`);
      errors.slice(0, 10).forEach(({ slug, error }) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${slug}: ${error}`);
      });
      if (errors.length > 10) {
        // eslint-disable-next-line no-console
        console.error(`  ... and ${errors.length - 10} more`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('All parties created successfully!');
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Error creating parties:', error);
    throw error;
  }
}
