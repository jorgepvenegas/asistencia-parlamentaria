import { client } from '@quienatiende/shared';
import fs from 'fs';
import path from 'path';

interface PartyData {
  slug: string;
  party: string;
}

async function updateAttendanceFromFile(filePath: string) {
  try {
    // Read parties data from JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parties: PartyData[] = JSON.parse(fileContent);

    console.log(`Creating ${parties.length} parties...`);

    let successful = 0;
    let failed = 0;
    const failedRecords: { slug: string; error: string }[] = [];

    // Process sequentially with delay to avoid worker timeout
    for (const { slug, party } of parties) {
      try {
        await client.api.parties.$post({
          json: {
            abbreviation: party,
            name: party,
            slug
          }
        });
        successful++;
        process.stdout.write('.');
      } catch (error) {
        failed++;
        failedRecords.push({
          slug,
          error: String(error)
        });
        process.stdout.write('X');
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 50));
    }

    console.log(`\n\n✓ Successfully created ${successful} parties`);

    if (failed > 0) {
      console.error(`✗ Failed to create ${failed} parties:`);
      failedRecords.slice(0, 10).forEach(({ slug, error }) => {
        console.error(`  - ${slug}: ${error}`);
      });
      if (failedRecords.length > 10) {
        console.error(`  ... and ${failedRecords.length - 10} more`);
      }
    } else {
      console.log('All parties created successfully!');
    }
  } catch (error) {
    console.error('Error creating parties:', error);
    process.exit(1);
  }
}

// Get file path from command line args or use default
const filePath = process.argv[2] || './parties.json';
const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  console.log('Usage: tsx create-parties.ts <path-to-parties.json>');
  process.exit(1);
}

updateAttendanceFromFile(resolvedPath);
