import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Product } from '@/radar/domain/entities/Product';

/**
 * Dynamically discovers available products by scanning radar-data directory
 * This ensures new products are automatically available without code changes
 */
export function getAvailableProducts(): Product[] {
  try {
    const radarDataPath = join(process.cwd(), 'radar-data');
    const files = readdirSync(radarDataPath);

    const products: Product[] = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const productId = file.replace('.json', '');

        try {
          // Read the JSON file to extract product metadata
          const filePath = join(radarDataPath, file);
          const content = readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Extract repository from first entry if available
          const repository = data[0]?.repository || productId;

          // Generate a human-readable name from the product ID
          const name = formatProductName(productId);

          return {
            id: productId,
            name,
            repository,
          };
        } catch (error) {
          console.warn(`Failed to read product metadata for ${productId}:`, error);
          // Fallback to basic product info
          return {
            id: productId,
            name: formatProductName(productId),
            repository: productId,
          };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return products;
  } catch (error) {
    console.error('Failed to discover products:', error);
    return [];
  }
}

/**
 * Converts a product ID to a human-readable name
 * Examples:
 *   'membresias-web' -> 'Membresías Web'
 *   'todo-app' -> 'TodoApp'
 *   'tech-radar' -> 'Tech Radar'
 */
function formatProductName(productId: string): string {
  return productId
    .split('-')
    .map(word => {
      // Special cases for Spanish words
      if (word === 'membresias') return 'Membresías';
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Gets list of product IDs (for repositories)
 */
export function getProductIds(): string[] {
  return getAvailableProducts().map(p => p.id);
}
