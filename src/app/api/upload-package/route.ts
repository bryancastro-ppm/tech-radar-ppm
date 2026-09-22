import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { detectDependenciesFromContent } from '@/ingest/application/use-cases/detectDependenciesFromContent';
import { toRadarEntries } from '@/ingest/application/use-cases/toRadarEntries';
import { markNewEntries } from '@/ingest/application/use-cases/markNewEntries';
import { fetchPreviousEntries } from '@/ingest/infrastructure/output/fetchPreviousEntries';
import { writeRadarJson } from '@/ingest/infrastructure/output/writeRadarJson';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const PRODUCT_NAME_REGEX = /^[a-z0-9-]+$/;

interface UploadResponse {
  success: boolean;
  product?: string;
  dependenciesDetected?: number;
  newDependencies?: number;
  uncategorizedCount?: number;
  filePath?: string;
  error?: string;
  details?: string;
}

/**
 * POST /api/upload-package
 *
 * Handles package.json file uploads and processes dependencies.
 *
 * Request body (multipart/form-data):
 * - file: package.json file
 * - productName: Product identifier (lowercase, alphanumeric, hyphens only)
 * - repository: Optional repository name (defaults to productName)
 *
 * Returns:
 * - 200: Success with dependency statistics
 * - 400: Invalid request (bad JSON, no dependencies, invalid product name)
 * - 413: File too large
 * - 500: Server error
 */
export async function POST(request: Request): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const productName = formData.get('productName') as string | null;
    const repository = formData.get('repository') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 },
      );
    }

    // Validate product name format (lowercase, alphanumeric, hyphens only)
    if (!PRODUCT_NAME_REGEX.test(productName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product name',
          details: 'Product name must contain only lowercase letters, numbers, and hyphens',
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024}KB`,
        },
        { status: 413 },
      );
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'File must be a JSON file' },
        { status: 400 },
      );
    }

    console.log(`[Upload] Processing package.json for product: ${productName}`);

    // Read file content
    const content = await file.text();

    // Step 1: Detect dependencies from content
    let detected;
    try {
      detected = await detectDependenciesFromContent(content);
      console.log(`[Upload] Detected ${detected.length} dependencies`);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse package.json',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 },
      );
    }

    // Step 2: Convert to radar entries
    const repositoryName = repository || productName;
    const withoutFlag = toRadarEntries(detected, productName, repositoryName);
    console.log(`[Upload] Converted to radar entries`);

    // Step 3: Fetch previous entries to mark new ones
    const outputDir = './radar-data';
    const previous = await fetchPreviousEntries(productName, outputDir);
    console.log(`[Upload] Loaded ${previous.length} previous entries`);

    // Step 4: Mark new entries
    const entries = markNewEntries(withoutFlag, previous);
    const newCount = entries.filter((e) => e.isNew).length;
    const uncategorizedCount = entries.filter((e) => e.quadrant === 'sin-categorizar').length;
    console.log(`[Upload] Marked ${newCount} as new, ${uncategorizedCount} uncategorized`);

    // Step 5: Write to radar-data
    await writeRadarJson(productName, entries, outputDir);
    const filePath = `radar-data/${productName}.json`;
    console.log(`[Upload] Written to ${filePath}`);

    // Step 6: Revalidate cache
    revalidateTag('radar-data', 'max');
    console.log(`[Upload] Cache revalidated`);

    return NextResponse.json({
      success: true,
      product: productName,
      dependenciesDetected: detected.length,
      newDependencies: newCount,
      uncategorizedCount,
      filePath,
    });
  } catch (error) {
    console.error('[Upload] Error processing upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
