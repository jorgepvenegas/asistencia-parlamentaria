/**
 * Bundle size analyzer for QuienAtiende frontend
 * Analyzes Astro build output and reports bundle size metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const LIMIT_KB = 500; // Constitution.md requirement

/**
 * Get total size of all files in dist directory
 */
function getDistSize(dir, totalSize = 0) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDistSize(filePath, 0);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️  Dist directory not found: ${DIST_DIR}`);
      console.log('Run "pnpm build" first to generate bundle');
      return 0;
    }
    throw err;
  }
}

/**
 * Analyze bundle by file type
 */
function analyzeByType(dir, stats = {}) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.isDirectory()) {
        analyzeByType(filePath, stats);
      } else {
        const ext = path.extname(file) || 'other';
        if (!stats[ext]) {
          stats[ext] = { count: 0, size: 0 };
        }
        stats[ext].count += 1;
        stats[ext].size += fileStats.size;
      }
    }

    return stats;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return stats;
    }
    throw err;
  }
}

/**
 * Format bytes as human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main analysis
 */
function main() {
  console.log('📦 QuienAtiende Bundle Analysis\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.log('❌ Dist directory not found');
    console.log('Run "pnpm build" first\n');
    process.exit(1);
  }

  // Get total size
  const totalSize = getDistSize(DIST_DIR);
  const totalSizeKb = totalSize / 1024;

  // Analyze by type
  const byType = analyzeByType(DIST_DIR);

  console.log(`Total size: ${formatBytes(totalSize)} (${totalSizeKb.toFixed(1)} KB)\n`);

  // Report by type
  console.log('Breakdown by file type:');
  const sorted = Object.entries(byType)
    .sort((a, b) => b[1].size - a[1].size);

  for (const [ext, data] of sorted) {
    const percent = ((data.size / totalSize) * 100).toFixed(1);
    console.log(
      `  ${ext || '(no ext)'.padEnd(10)}: ${formatBytes(data.size).padStart(10)} (${data.count} files, ${percent}%)`
    );
  }

  // Check limit
  console.log('');
  if (totalSizeKb > LIMIT_KB) {
    console.log(`❌ Bundle size exceeds limit: ${totalSizeKb.toFixed(1)}KB > ${LIMIT_KB}KB`);
    process.exit(1);
  } else {
    const remaining = LIMIT_KB - totalSizeKb;
    console.log(`✅ Bundle size OK: ${totalSizeKb.toFixed(1)}KB < ${LIMIT_KB}KB`);
    console.log(`   Remaining budget: ${remaining.toFixed(1)}KB\n`);
    process.exit(0);
  }
}

main();
