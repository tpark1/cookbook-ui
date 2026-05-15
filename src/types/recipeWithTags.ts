import type { Recipe } from "./supabase";

export type RecipeWithTags = Recipe & {
  recipe_tags: { tags: { id: number; name: string } }[];
};
