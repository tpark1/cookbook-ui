import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../clients/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

import { TagsSection } from "@/components/tagsSection";
import type { Tag } from "@/types/supabase";

interface RecipeForm {
  name: string;
  category: string;
  ingredients: { name: string }[]; // Array of objects for RHF
  directions: { step: string }[];
  tags: number[];
  recipeImage: FileList;
}

const NewRecipePage = () => {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecipeForm>({
    mode: "onBlur",
    defaultValues: {
      ingredients: [{ name: "" }],
      directions: [{ step: "" }],
      tags: [],
    },
  });

  const handleTagsChange = (selectedTags: Tag[]) => {
    const tagNames = selectedTags.map((t) => t.id);
    setValue("tags", tagNames);
  };

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: directionFields,
    append: appendDirection,
    remove: removeDirection,
  } = useFieldArray({
    control,
    name: "directions",
  });

  const onSubmit = async (data: RecipeForm) => {
    console.log("Form Data:", data);
    // Get fields
    const ingredientList = data.ingredients.map((ing) => ing.name);
    const directionsList = data.directions.map((dir) => dir.step);
    const tagList = data.tags;
    console.log("tagList", tagList);

    const { data: recipeResult, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          name: data.name,
          ingredients: ingredientList,
          directions: directionsList,
        },
      ])
      .select()
      .single();

    if (recipeError) {
      console.error("Error saving recipe:", recipeError.message);
      return;
    }

    const newRecipeId = recipeResult.id;
    if (data.tags.length > 0) {
      // Format the data for the recipe_tags table
      const joinTableEntries = data.tags.map((tag) => ({
        id: newRecipeId,
        tag_id: tag,
      }));

      const { error: tagError } = await supabase
        .from("recipe_tags")
        .insert(joinTableEntries);

      if (tagError) {
        console.error("Error linking tags:", tagError.message);
      }
    }

    console.log("Success! Recipe and Tags linked.");
    navigate("/");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 space-y-6"
    >
      <h1 className="text-2xl font-bold">Add New Recipe</h1>

      {/* --- Basic Text Input --- */}
      <div>
        <Label>Recipe Name</Label>
        <input
          {...register("name", { required: "Name is required" })}
          className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
          placeholder="Grandma's Chili"
        />
      </div>
      {errors.name && (
        <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
      )}

      <TagsSection onTagsSelected={handleTagsChange} />

      {/* --- Dynamic Ingredients List --- */}
      <div className="space-y-2">
        <Label className="block font-medium">Ingredients</Label>
        {ingredientFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`ingredients.${index}.name` as const)}
              className="flex-1 border p-2 rounded"
              placeholder="e.g. 2 cups of flour"
            />
            <Button
              type="button"
              variant="destructiveNoBackground"
              onClick={() => removeIngredient(index)}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="text"
          onClick={() => appendIngredient({ name: "" })}
        >
          <Plus /> Add Ingredient
        </Button>
      </div>

      {/* --- Dynamic Directions List --- */}
      <div className="space-y-2">
        <Label className="block font-medium">Directions</Label>
        {directionFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-full h-10 w-10 shrink-0 mt-1">
              {index + 1}
            </div>
            <input
              {...register(`directions.${index}.step` as const)}
              className="flex-1 border p-2 rounded"
              placeholder="e.g. Chop onions, peppers, and garlic"
            />
            <Button
              type="button"
              variant="destructiveNoBackground"
              onClick={() => removeDirection(index)}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="text"
          onClick={() => appendDirection({ step: "" })}
        >
          <Plus /> Add Direction
        </Button>
      </div>

      {/* --- File Input (The future photo) --- */}
      <div>
        <Label className="block font-medium">Recipe Photo</Label>
        <input
          type="file"
          {...register("recipeImage")}
          className="w-full text-sm text-gray-500"
        />
      </div>

      <Button type="submit" variant="default">
        Save
      </Button>
    </form>
  );
};

export default NewRecipePage;
