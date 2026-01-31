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
  createdCount: number;
  existingCount: number;
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
    console.log(`Processing ${parties.length} parties...`);

    let createdCount = 0;
    let existingCount = 0;
    let failureCount = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    // Fetch existing parties to skip duplicates
    const partiesRequest = await client.api.parties.$get();

    if (!partiesRequest.ok) {
      console.error('Failed to fetch existing parties:', partiesRequest.statusText);
      throw new Error('Failed to fetch existing parties');
    }

    const existingPartiesData = (await partiesRequest.json()) as {
      data: Array<{ slug: string }>;
    };
    const existingSlugs = new Set(existingPartiesData.data.map((p) => p.slug));

    for (const { slug, party } of parties) {
      try {
        if (existingSlugs.has(slug)) {
          existingCount++;
          process.stdout.write('.');
        } else {
          await client.api.parties.$post({
            json: {
              abbreviation: party,
              name: party,
              slug,
            },
          });
          createdCount++;
          process.stdout.write('+');
          // eslint-disable-next-line no-await-in-loop
          await withDelay(config.delays.partyCreate);
        }
      } catch (error) {
        failureCount++;
        errors.push({
          slug,
          error: String(error),
        });
        process.stdout.write('X');
      }
    }

    const total = createdCount + existingCount;
    // eslint-disable-next-line no-console
    console.log(`\n\n✓ Processed ${total}: ${createdCount} created, ${existingCount} existing`);

    if (failureCount > 0) {
      // eslint-disable-next-line no-console
      console.error(`✗ Failed to process ${failureCount} parties:`);
      errors.slice(0, 10).forEach(({ slug, error }) => {
        // eslint-disable-next-line no-console
        console.error(`  - ${slug}: ${error}`);
      });
      if (errors.length > 10) {
        // eslint-disable-next-line no-console
        console.error(`  ... and ${errors.length - 10} more`);
      }
    }

    return {
      success: failureCount === 0,
      createdCount,
      existingCount,
      failureCount,
      errors,
    };
  } catch (error) {
    console.error('Error processing parties:', error);
    throw error;
  }
}
