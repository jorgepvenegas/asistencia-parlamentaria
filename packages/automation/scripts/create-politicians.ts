import fs from 'fs';
import path from 'path';
import { createPoliticiansFromFile } from '../src/index.js';

const filePath = process.argv[2] || './temp/politicians.json';
const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  // eslint-disable-next-line no-console
  console.error(`File not found: ${resolvedPath}`);
  // eslint-disable-next-line no-console
  console.log('Usage: tsx create-politicians.ts <path-to-politicians.json>');
  process.exit(1);
}

createPoliticiansFromFile(resolvedPath)
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
