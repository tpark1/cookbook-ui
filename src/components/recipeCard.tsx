import type { Recipe } from "@/types/supabase";
import { Link } from "react-router-dom";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
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
      </div>
    </Link>
  );
}
