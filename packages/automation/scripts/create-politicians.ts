import { client } from '@quienatiende/shared';
import fs from 'fs';
import path from 'path';
import { getTodayFormatted, PoliticianAttendance } from './scrape-attendance';

async function createPoliticiansFromFile(filePath: string) {
  try {
    // Read politicians data from JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const politicians: PoliticianAttendance[] = JSON.parse(fileContent);

    console.log(`Creating ${politicians.length} politicians...`);

    let successful = 0;
    let failed = 0;
    const failedRecords: { name: string; error: string }[] = [];

    const politiciansRequest = await client.api.politicians.$get();
    const existingPoliticiansData = await politiciansRequest.json();

    // Process sequentially with delay to avoid worker timeout
    for (const { name, partySlug, absent, attended, justifiedAbsent, percentage, unjustifiedAbsent } of politicians) {
      try {
        // Create only if doesn't exist

        let match = existingPoliticiansData.data.find(epd => epd.name === name);

        if(!match) {
          match = await client.api.politicians.$post({
            json: {
              name,
              partySlug
            }
          });
          await new Promise(r => setTimeout(r, 100));
        }

        const attendanceResponse = await client.api.attendance.$post({
          json: {
            attendanceAverage: percentage,
            attendanceCount: attended,
            politicianId: match.id,
            date: getTodayFormatted()
          }
        })

        if(!attendanceResponse.ok) {
          const errorData = await attendanceResponse.json();
          console.error(`\nError creating attendance for ${name}:`, attendanceResponse.status, errorData);
        }

        
        successful++;
        process.stdout.write('.');
      } catch (error) {
        failed++;
        failedRecords.push({
          name,
          error: String(error)
        });
        process.stdout.write('X');
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\n\n✓ Successfully created ${successful} politicians`);

    if (failed > 0) {
      console.error(`✗ Failed to create ${failed} politicians:`);
      failedRecords.slice(0, 10).forEach(({ name, error }) => {
        console.error(`  - ${name}: ${error}`);
      });
      if (failedRecords.length > 10) {
        console.error(`  ... and ${failedRecords.length - 10} more`);
      }
    } else {
      console.log('All politicians created successfully!');
    }
  } catch (error) {
    console.error('Error creating politicians:', error);
    process.exit(1);
  }
}

// Get file path from command line args or use default
const filePath = process.argv[2] || './temp/politicians.json';
const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  console.log('Usage: tsx create-politicians.ts <path-to-politicians.json>');
  process.exit(1);
}

createPoliticiansFromFile(resolvedPath);
