import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../clients/supabaseClient";
import { type Recipe } from "../types/supabase";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipeCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase.from("recipes").select("*");
      if (error) {
        console.log("error fetching recipes from DB", error);
      } else {
        console.log("data", data);
        if (data !== null) {
          setRecipes(data);
        }
      }
    }
    fetchRecipes();
  }, []);

  return (
    <div>
      <section>Filtering section placeholder</section>
      <section>Active filters section placeholder</section>
      <Button
        onClick={() => {
          navigate("/new");
        }}
      >
        Create
      </Button>
      <section className="grid grid-cols-2 gap-4">
        {recipes.map((recipe) => {
          return <RecipeCard key={recipe.id} recipe={recipe} />;
        })}
      </section>
    </div>
  );
};

export default HomePage;
