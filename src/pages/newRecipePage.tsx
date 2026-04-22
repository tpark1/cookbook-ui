import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../clients/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useState } from "react";
import TagsDialog from "@/components/tagsDialog";

interface RecipeForm {
  title: string;
  category: string;
  ingredients: { name: string }[]; // Array of objects for RHF
  recipeImage: FileList;
}

const NewRecipePage = () => {
  const navigate = useNavigate();
  const [tagsVisible, setTagsVisible] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeForm>({
    mode: "onBlur",
    defaultValues: {
      ingredients: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const onSubmit = async (data: RecipeForm) => {
    console.log("Form Data:", data);
    // 1. Transform the ingredients from [{name: 'flour'}] to ['flour']
    const ingredientList = data.ingredients.map((ing) => ing.name);

    // 2. The "SQL" Query (via Supabase Client)
    const { data: result, error } = await supabase
      .from("recipes") // The table name
      .insert([
        {
          name: data.title,
          ingredients: ingredientList, // Now a simple text array
          // instructions: data.instructions, (add other fields here)
        },
      ])
      .select(); // This returns the newly created row

    if (error) {
      console.error("Error saving recipe:", error.message);
    } else {
      console.log("Success! Saved:", result);
      navigate("/");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 space-y-6"
    >
      <h1 className="text-2xl font-bold">Add New Recipe</h1>

      {/* --- Basic Text Input --- */}
      <div>
        <label className="block font-medium">Recipe Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className={`w-full border p-2 rounded ${errors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder="Grandma's Chili"
        />
      </div>
      {errors.title && (
        <span className="text-red-500 text-sm mt-1">
          {errors.title.message}
        </span>
      )}

      {/* Tags section */}
      <div>
        <Label>Tags</Label>
        <Badge
          onClick={() => {
            console.log("badge clicked");
            setTagsVisible(true);
          }}
        >
          <Plus />
          Add tag
        </Badge>
      </div>

      <TagsDialog
        open={tagsVisible}
        closeDialog={() => setTagsVisible(false)}
      />

      {/* --- Dynamic Ingredients List --- */}
      <div className="space-y-2">
        <label className="block font-medium">Ingredients</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`ingredients.${index}.name` as const)}
              className="flex-1 border p-2 rounded"
              placeholder="e.g. 2 cups of flour"
            />
            <Button
              type="button"
              variant="destructiveNoBackground"
              onClick={() => remove(index)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="text"
          onClick={() => append({ name: "" })}
        >
          + Add Ingredient
        </Button>
      </div>

      {/* --- File Input (The future photo) --- */}
      <div>
        <label className="block font-medium">Recipe Photo</label>
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
