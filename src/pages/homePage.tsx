import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../clients/supabaseClient";
import { type Recipe } from "../types/supabase";
import { Button } from "@/components/ui/button";

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
          return <div key={recipe.id}>{recipe.name}</div>;
        })}
        <div>test1</div>
        <div>test2</div>
        <div>test3</div>
        <div>test4</div>
      </section>
    </div>
  );
};

export default HomePage;
