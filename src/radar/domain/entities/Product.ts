export interface Product {
  readonly id: string;
  readonly name: string;
  readonly repository: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'membresias-web',
    name: 'Membresías Web',
    repository: 'membresias-web',
  },
  {
    id: 'membresias-backoffice',
    name: 'Membresías Backoffice',
    repository: 'membresias-backoffice',
  },
];
