import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../clients/supabaseClient";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipeCard";
import type { RecipeWithTags } from "@/types/recipeWithTags";
import { FilterSection } from "@/components/filterSection";
import type { Tag } from "@/types/supabase";

const HomePage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeWithTags[]>([]);
  const [filtered, setFiltered] = useState<RecipeWithTags[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_tags(tags(*))");

      if (error) {
        console.log("error fetching recipes from DB", error);
      } else if (data !== null) {
        const recipesWithTags = data.map((recipe) => ({
          ...recipe,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tags: recipe.recipe_tags.map((rt: any) => rt.tags),
        }));
        recipesWithTags.sort((a, b) => a.name.localeCompare(b.name));
        setRecipes(recipesWithTags);
        setFiltered(recipesWithTags);
      }
    }
    fetchRecipes();
  }, []);

  function handleFiltersChange(nameQuery: string, selectedTagIds: number[]) {
    let result = recipes;

    if (nameQuery.trim()) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    if (selectedTagIds.length > 0) {
      result = result.filter((r) =>
        selectedTagIds.some((id) =>
          r.tags.map((tag: Tag) => tag.id).includes(id),
        ),
      );
    }

    setFiltered(result);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Button onClick={() => navigate("/new")}>Create</Button>
      </div>

      <FilterSection onFiltersChange={handleFiltersChange} />

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No recipes match your filters.
        </p>
      ) : (
        <section className="grid grid-cols-2 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} tags={recipe.tags} />
          ))}
        </section>
      )}
    </div>
  );
};

export default HomePage;
