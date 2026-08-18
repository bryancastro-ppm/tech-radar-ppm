#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { categorizePackage } from './categorize';
import type { Ring } from '../../src/radar/domain/value-objects/Ring';

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface RadarEntry {
  name: string;
  version: string;
  quadrant: string;
  ring: Ring;
  product: string;
  repository: string;
  isNew: boolean;
}

interface PreviousData {
  entries: RadarEntry[];
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]+/, '');
}

function loadPreviousEntries(outputPath: string): Set<string> {
  if (!existsSync(outputPath)) {
    return new Set();
  }

  try {
    const content = readFileSync(outputPath, 'utf-8');
    const data: RadarEntry[] = JSON.parse(content);
    return new Set(data.map((entry) => entry.name));
  } catch {
    return new Set();
  }
}

function scanDependencies(
  packageJsonPath: string,
  productName: string,
  repositoryName: string,
  outputDir: string,
): RadarEntry[] {
  const absolutePath = resolve(packageJsonPath);

  if (!existsSync(absolutePath)) {
    console.error(`package.json not found at: ${absolutePath}`);
    process.exit(1);
  }

  const content = readFileSync(absolutePath, 'utf-8');
  const packageJson: PackageJson = JSON.parse(content);

  const outputPath = join(outputDir, `${productName}.json`);
  const previousEntries = loadPreviousEntries(outputPath);

  const allDependencies: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const entries: RadarEntry[] = Object.entries(allDependencies).map(
    ([name, version]) => ({
      name,
      version: cleanVersion(version),
      quadrant: categorizePackage(name),
      ring: 'adopt' as Ring,
      product: productName,
      repository: repositoryName,
      isNew: !previousEntries.has(name),
    }),
  );

  entries.sort((a, b) => a.name.localeCompare(b.name));

  return entries;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: npx tsx scanDependencies.ts <package.json-path> <product-name> <repository-name> [output-dir]');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx scanDependencies.ts /path/to/membresias-web/package.json membresias-web membresias-web ./radar-data');
    process.exit(1);
  }

  const [packageJsonPath, productName, repositoryName, outputDir = './radar-data'] = args;

  console.log(`Scanning dependencies for ${productName}...`);
  console.log(`  Package.json: ${packageJsonPath}`);
  console.log(`  Output dir: ${outputDir}`);

  const entries = scanDependencies(packageJsonPath, productName, repositoryName, outputDir);

  const outputPath = join(outputDir, `${productName}.json`);
  writeFileSync(outputPath, JSON.stringify(entries, null, 2));

  console.log(`\nGenerated ${outputPath} with ${entries.length} dependencies`);

  const newEntries = entries.filter((e) => e.isNew);
  if (newEntries.length > 0) {
    console.log(`\nNew dependencies detected (${newEntries.length}):`);
    newEntries.forEach((e) => console.log(`  - ${e.name}@${e.version}`));
  }

  const uncategorized = entries.filter((e) => e.quadrant === 'sin-categorizar');
  if (uncategorized.length > 0) {
    console.log(`\nUncategorized dependencies (${uncategorized.length}):`);
    uncategorized.forEach((e) => console.log(`  - ${e.name}`));
  }
}

main();
