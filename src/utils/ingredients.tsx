type IngredientGroup = { heading: string | null; items: string[] };

export function groupIngredients(ingredients: string[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  let current: IngredientGroup = { heading: null, items: [] };

  for (const raw of ingredients) {
    const trimmed = raw.trim();
    const headingMatch = trimmed.match(/^\[(.+)\]$/);

    if (headingMatch) {
      // start a new group whenever we hit a "[Section Name]" line
      if (current.heading !== null || current.items.length > 0) {
        groups.push(current);
      }
      current = { heading: headingMatch[1], items: [] };
    } else {
      current.items.push(raw);
    }
  }
  groups.push(current);

  return groups.filter((g) => g.heading !== null || g.items.length > 0);
}
