import type { Recipe, Tag } from "./supabase";

export type RecipeWithTags = Recipe & {
  tags: Tag[];
};
