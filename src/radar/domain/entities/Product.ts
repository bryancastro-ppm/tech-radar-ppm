export interface Product {
  readonly id: string;
  readonly name: string;
  readonly repository: string;
}

/**
 * @deprecated Use getAvailableProducts() from infrastructure layer instead.
 * This will be automatically populated from radar-data directory.
 * Kept for backward compatibility only.
 */
export const PRODUCTS: Product[] = [];
