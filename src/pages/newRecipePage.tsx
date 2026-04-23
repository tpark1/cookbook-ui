import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../clients/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge, type BadgeVariants } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import TagsDialog from "@/components/tagsDialog";
import { type Tag } from "../types/supabase";

interface RecipeForm {
  name: string;
  category: string;
  ingredients: { name: string }[]; // Array of objects for RHF
  recipeImage: FileList;
}

const NewRecipePage = () => {
  const navigate = useNavigate();
  const [tagsVisible, setTagsVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

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
          name: data.name,
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

      {/* Tags section */}
      <Label>Tags</Label>
      <div className="flex gap-2">
        {tags
          .sort((a, b) =>
            a.name !== null && b.name !== null
              ? a.name.localeCompare(b.name)
              : 0,
          )
          .map((tag) => {
            return (
              <Badge
                key={tag.id}
                variant={(tag.color as BadgeVariants["variant"]) ?? "default"}
                onClick={() => {
                  setTags(tags.filter((t) => t.id !== tag.id));
                }}
              >
                <X />
                {tag.name}
              </Badge>
            );
          })}
        <Badge
          onClick={() => {
            console.log("badge clicked");
            setTagsVisible(true);
          }}
        >
          <Plus />
          Add tags
        </Badge>
      </div>

      <TagsDialog
        open={tagsVisible}
        closeDialog={() => setTagsVisible(false)}
        saveTags={setTags}
      />

      {/* --- Dynamic Ingredients List --- */}
      <div className="space-y-2">
        <Label className="block font-medium">Ingredients</Label>
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
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="text"
          onClick={() => append({ name: "" })}
        >
          <Plus /> Add Ingredient
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
