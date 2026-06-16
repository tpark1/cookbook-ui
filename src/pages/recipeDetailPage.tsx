import { supabase } from "@/clients/supabaseClient";
import { Button } from "@/components/ui/button";
import type { RecipeWithTags } from "@/types/recipeWithTags";
import type { Tag } from "@/types/supabase";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeWithTags | undefined>(undefined);

  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_tags(tags(*))")
        .eq("id", id)
        .single();
      if (!error) {
        setRecipe({
          ...data,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tags: data.recipe_tags.map((rt: any) => rt.tags),
        });
      }
    }
    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back
      </button>
      <Button onClick={() => navigate(`/recipes/${id}/edit`)}>Edit</Button>

      {/* Image */}
      {recipe.picture_urls && recipe.picture_urls.length > 0 && (
        <img
          src={recipe.picture_urls[0]}
          alt={recipe.name}
          className="w-full rounded-lg object-cover max-h-80"
        />
      )}

      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-bold">{recipe.name}</h1>
        {recipe.description && (
          <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        )}
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag: Tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Time & Yield */}
      <div className="flex gap-6 rounded-lg border p-4 text-sm">
        {recipe.prep_time !== null && (
          <div>
            <p className="font-medium">Prep Time</p>
            <p className="text-muted-foreground">{recipe.prep_time} min</p>
          </div>
        )}
        {recipe.cook_time !== null && (
          <div>
            <p className="font-medium">Cook Time</p>
            <p className="text-muted-foreground">{recipe.cook_time} min</p>
          </div>
        )}
        {recipe.prep_time !== null && recipe.cook_time !== null && (
          <div>
            <p className="font-medium">Total Time</p>
            <p className="text-muted-foreground">
              {recipe.prep_time + recipe.cook_time} min
            </p>
          </div>
        )}
        {recipe.yield !== undefined && (
          <div>
            <p className="font-medium">Yield</p>
            <p className="text-muted-foreground">{recipe.yield} servings</p>
          </div>
        )}
      </div>

      {/* Ingredients */}
      {recipe.ingredients && (
        <div>
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
            {(recipe.ingredients as string[]).map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Directions */}
      {recipe.directions && recipe.directions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Directions</h2>
          <ol className="mt-2 space-y-3 list-decimal list-inside text-sm">
            {recipe.directions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Sources */}
      {recipe.sources && (
        <div>
          <h2 className="text-xl font-semibold">Source</h2>
          <a
            href={recipe.sources}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-blue-500 hover:underline"
          >
            {recipe.sources}
          </a>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;
