import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

function runCommand(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function syncData() {
  const tempDir = path.join(process.cwd(), 'temp');
  const partiesPath = path.join(tempDir, 'parties.json');
  const politiciansPath = path.join(tempDir, 'politicians.json');

  try {
    console.log('📡 Step 1: Scraping chamber data...\n');
    await runCommand('tsx', ['scripts/scrape-attendance.ts']);

    console.log('\n\n✅ Step 2: Creating parties...\n');
    await runCommand('tsx', ['scripts/create-parties.ts', partiesPath]);

    console.log('\n\n✅ Step 3: Creating politicians...\n');
    await runCommand('tsx', ['scripts/create-politicians.ts', politiciansPath]);

    console.log('\n\n🧹 Step 4: Cleaning up temp files...');
    fs.rmSync(tempDir, { recursive: true });
    console.log('✓ Deleted ./temp directory');

    console.log('\n\n✨ All done! Data synced successfully.');
  } catch (error) {
    console.error('\n❌ Error during sync:', error);
    process.exit(1);
  }
}

syncData().catch(console.error);
