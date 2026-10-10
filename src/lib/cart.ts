/** Upper bound for a single cart line; enforced in the bag UI and again by the checkout action. */
export const MAX_QTY_PER_LINE = 10;

export function cartLineKey(id: number | null, size: string | null): string {
  return `${id}:${size}`;
}
