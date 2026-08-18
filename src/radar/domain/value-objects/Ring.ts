export const RINGS = ['adopt', 'trial', 'assess', 'hold'] as const;
export type Ring = (typeof RINGS)[number];
