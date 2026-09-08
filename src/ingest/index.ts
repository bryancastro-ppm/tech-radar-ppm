#!/usr/bin/env node

import { detectDependencies } from '@/ingest/application/use-cases/detectDependencies';
import { toRadarEntries } from '@/ingest/application/use-cases/toRadarEntries';
import { markNewEntries } from '@/ingest/application/use-cases/markNewEntries';
import { fetchPreviousEntries } from '@/ingest/infrastructure/output/fetchPreviousEntries';
import { writeRadarJson } from '@/ingest/infrastructure/output/writeRadarJson';

/**
 * Main entry point for the dependency detection CLI.
 * 
 * Environment variables:
 * - REPO_PATH: Path to the repository to scan (defaults to current directory)
 * - PRODUCT_NAME: Name of the product (required)
 * - GITHUB_REPOSITORY: GitHub repository name (required)
 * - OUTPUT_DIR: Output directory for radar data (defaults to ./radar-data)
 * 
 * Example usage:
 * ```bash
 * REPO_PATH=/path/to/repo PRODUCT_NAME=membresias-web GITHUB_REPOSITORY=membresias-web npx tsx src/ingest/index.ts
 * ```
 */
async function main() {
  const repoPath = process.env.REPO_PATH ?? '.';
  const product = process.env.PRODUCT_NAME;
  const repository = process.env.GITHUB_REPOSITORY;
  const outputDir = process.env.OUTPUT_DIR ?? './radar-data';

  if (!product || !repository) {
    console.error('❌ Error: PRODUCT_NAME and GITHUB_REPOSITORY are required');
    console.error('');
    console.error('Usage:');
    console.error('  PRODUCT_NAME=<name> GITHUB_REPOSITORY=<repo> npx tsx src/ingest/index.ts');
    console.error('');
    console.error('Optional environment variables:');
    console.error('  REPO_PATH=<path>       Path to repository (default: current directory)');
    console.error('  OUTPUT_DIR=<path>      Output directory (default: ./radar-data)');
    process.exit(1);
  }

  console.log(`🔍 Scanning dependencies for ${product}...`);
  console.log(`   Repository: ${repository}`);
  console.log(`   Path: ${repoPath}`);
  console.log(`   Output: ${outputDir}`);
  console.log('');

  try {
    // Step 1: Detect dependencies from package.json and lockfile
    const detected = await detectDependencies(repoPath);
    console.log(`✓ Detected ${detected.length} dependencies`);

    // Step 2: Convert to radar entries
    const withoutFlag = toRadarEntries(detected, product, repository);
    console.log(`✓ Converted to radar entries`);

    // Step 3: Fetch previous entries to mark new ones
    const previous = await fetchPreviousEntries(product, outputDir);
    console.log(`✓ Loaded ${previous.length} previous entries`);

    // Step 4: Mark new entries
    const finalEntries = markNewEntries(withoutFlag, previous);
    const newCount = finalEntries.filter((e) => e.isNew).length;
    console.log(`✓ Marked ${newCount} new dependencies`);

    // Step 5: Write to output
    await writeRadarJson(product, finalEntries, outputDir);
    console.log('');
    console.log(`✅ Successfully wrote ${finalEntries.length} dependencies to ${outputDir}/${product}.json`);

    // Summary
    if (newCount > 0) {
      console.log('');
      console.log(`📦 New dependencies (${newCount}):`);
      finalEntries
        .filter((e) => e.isNew)
        .forEach((e) => console.log(`   - ${e.name}@${e.version}`));
    }

    const uncategorized = finalEntries.filter((e) => e.quadrant === 'sin-categorizar');
    if (uncategorized.length > 0) {
      console.log('');
      console.log(`⚠️  Uncategorized dependencies (${uncategorized.length}):`);
      uncategorized.forEach((e) => console.log(`   - ${e.name}`));
      console.log('');
      console.log('   Consider adding these to src/core/config/categorization-map.ts');
    }
  } catch (error) {
    console.error('');
    console.error('❌ Failed to detect dependencies:');
    console.error('  ', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
