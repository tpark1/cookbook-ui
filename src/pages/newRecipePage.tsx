import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../clients/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

import { TagsSection } from "@/components/tagsSection";
import type { Tag } from "@/types/supabase";
import { PicturePicker } from "@/components/picturePicker";
import { uploadRecipeImage } from "@/lib/uploadRecipeImage";

export interface RecipeForm {
  name: string;
  recipeImage: FileList;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  yield?: number;
  tags: number[];
  ingredients: { name: string }[]; // Array of objects for RHF
  directions: { step: string }[];
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
      prepTime: undefined,
      cookTime: undefined,
      yield: undefined,
      description: "",
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
    let imageUrl = "";
    if (data.recipeImage) {
      imageUrl = await uploadRecipeImage(data.recipeImage[0]);
    }

    // Get fields
    const ingredientList = data.ingredients.map((ing) => ing.name);
    const directionsList = data.directions.map((dir) => dir.step);
    const tagList = data.tags;
    const cookTime = data.cookTime;
    const prepTime = data.prepTime;
    const recipeYield = data.yield;

    const { data: recipeResult, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          name: data.name,
          ingredients: ingredientList,
          directions: directionsList,
          cook_time: cookTime,
          prep_time: prepTime,
          yield: recipeYield,
          picture_urls: [imageUrl],
        },
      ])
      .select()
      .single();

    if (recipeError) {
      console.error("Error saving recipe:", recipeError.message);
      return;
    }

    const newRecipeId = recipeResult.id;
    if (tagList.length > 0) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Recipe</h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <X />
        </Button>
      </div>

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

      <PicturePicker register={register} />

      <TagsSection onTagsSelected={handleTagsChange} />

      <Label className="block font-medium">Prep time</Label>
      <input
        id="prepTime"
        type="number"
        {...register("prepTime", {
          min: { value: 1, message: "Must be at least 1 minute" },
          valueAsNumber: true,
        })}
        className={`w-full border p-2 rounded ${errors.prepTime ? "border-red-500" : "border-gray-300"}`}
      />
      {errors.prepTime && (
        <span className="text-red-500 text-sm mt-1">
          {errors.prepTime.message}
        </span>
      )}

      <Label className="block font-medium">Cook time</Label>
      <input
        id="cookTime"
        type="number"
        {...register("cookTime", {
          min: { value: 1, message: "Must be at least 1 minute" },
          valueAsNumber: true,
        })}
        className={`w-full border p-2 rounded ${errors.cookTime ? "border-red-500" : "border-gray-300"}`}
      />
      {errors.cookTime && (
        <span className="text-red-500 text-sm mt-1">
          {errors.cookTime.message}
        </span>
      )}

      <Label className="block font-medium">Yield</Label>
      <input
        id="yield"
        type="number"
        {...register("yield", {
          min: { value: 1, message: "Must be at least 1" },
          valueAsNumber: true,
        })}
        className={`w-full border p-2 rounded ${errors.yield ? "border-red-500" : "border-gray-300"}`}
      />
      {errors.yield && (
        <span className="text-red-500 text-sm mt-1">
          {errors.yield.message}
        </span>
      )}

      <Label className="block font-medium">Description</Label>
      <textarea
        id="description"
        {...register("description", {})}
        placeholder="Description"
        className="w-full border p-2 rounded border-gray-300"
      />

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

      <Button type="submit" variant="default">
        Save
      </Button>
    </form>
  );
};

export default NewRecipePage;
