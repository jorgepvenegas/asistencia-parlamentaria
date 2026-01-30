import { scrapeAndWriteFiles } from '../src/index.js';

// eslint-disable-next-line no-console
console.log('Starting scraper...');

// eslint-disable-next-line @typescript-eslint/no-floating-promises
scrapeAndWriteFiles()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('\nNext steps:');
    // eslint-disable-next-line no-console
    console.log('  1. pnpm create-parties ./temp/parties.json');
    // eslint-disable-next-line no-console
    console.log('  2. pnpm create-politicians ./temp/politicians.json');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
