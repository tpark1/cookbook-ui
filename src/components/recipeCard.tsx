import type { Recipe, Tag } from "@/types/supabase";
import { Link } from "react-router-dom";

type RecipeCardProps = {
  recipe: Recipe;
  tags: Tag[];
};

export function RecipeCard({ recipe, tags }: RecipeCardProps) {
  return (
    <Link to={`/recipes/${recipe.id}`}>
      <div className="rounded-md border p-4 hover:bg-muted transition-colors">
        {recipe.picture_urls !== null ? (
          <img
            src={recipe.picture_urls[0]}
            className="h-40 w-full object-cover rounded"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">
            No photo
          </div>
        )}
        <h2 className="mt-2 font-semibold">{recipe.name}</h2>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <span
                key={`${recipe.id}-${tag.id}`}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
