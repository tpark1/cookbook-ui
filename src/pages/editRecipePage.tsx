import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "../clients/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GripVertical, Plus, X } from "lucide-react";
import { TagsSection } from "@/components/tagsSection";
import type { Tag } from "@/types/supabase";
import { PicturePicker } from "@/components/picturePicker";
import { uploadRecipeImage } from "@/lib/uploadRecipeImage";
import type { RecipeForm } from "./newRecipePage";

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [initialTags, setInitialTags] = useState<number[]>([]);
  const dragIndexIngredients = useRef<number>(0);
  const dragIndexDirections = useRef<number>(0);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecipeForm>({
    mode: "onBlur",
    defaultValues: {
      ingredients: [{ name: "" }],
      directions: [{ step: "" }],
      tags: [],
    },
  });

  // Fetch existing recipe and pre-populate the form
  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, recipe_tags(tags(id, name))")
        .eq("id", id)
        .single();

      if (error || !data) return;

      console.log("fetchRecipe", data);

      // Pre-populate simple fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingTags = data.recipe_tags.map((rt: any) => rt.tags.id);

      reset({
        name: data.name,
        description: data.description ?? "",
        prepTime: data.prep_time ?? undefined,
        cookTime: data.cook_time ?? undefined,
        yield: data.yield ?? undefined,
        ingredients: data.ingredients
          ? (data.ingredients as string[]).map((name) => ({ name }))
          : [{ name: "" }],
        directions: data.directions
          ? data.directions.map((step: string) => ({ step }))
          : [{ step: "" }],
        tags: existingTags,
        source: data.sources,
      });

      // Store existing image URL so we can keep it if no new image is picked
      if (data.picture_urls?.[0]) {
        setExistingImageUrl(data.picture_urls[0]);
      }

      // Pre-select tags in the TagsSection
      setInitialTags(existingTags);
    }

    fetchRecipe();
  }, [id, reset]);

  const handleTagsChange = (selectedTags: Tag[]) => {
    setValue(
      "tags",
      selectedTags.map((t) => t.id),
    );
  };

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
    move: moveIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: directionFields,
    append: appendDirection,
    remove: removeDirection,
    move: moveDirection,
  } = useFieldArray({ control, name: "directions" });

  const onSubmit = async (data: RecipeForm) => {
    // Use new image if picked, otherwise keep existing
    let imageUrl = existingImageUrl ?? "";
    if (data.recipeImage?.[0]) {
      imageUrl = await uploadRecipeImage(data.recipeImage[0]);
    }

    const { error: recipeError } = await supabase
      .from("recipes")
      .update({
        name: data.name,
        description: data.description,
        ingredients: data.ingredients.map((i) => i.name.trim()),
        directions: data.directions.map((d) => d.step.trim()),
        cook_time: data.cookTime,
        prep_time: data.prepTime,
        yield: data.yield,
        picture_urls: [imageUrl],
        sources: data.source,
      })
      .eq("id", id);

    if (recipeError) {
      console.error("Error updating recipe:", recipeError.message);
      return;
    }

    // Replace tags: delete existing then re-insert
    await supabase.from("recipe_tags").delete().eq("id", id);

    if (data.tags.length > 0) {
      const { error: tagError } = await supabase
        .from("recipe_tags")
        .insert(data.tags.map((tag_id) => ({ id, tag_id })));

      if (tagError) {
        console.error("Error updating tags:", tagError.message);
      }
    }

    navigate(`/recipes/${id}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <X />
        </Button>
      </div>

      <div>
        <Label>Recipe Name</Label>
        <input
          {...register("name", { required: "Name is required" })}
          className={`w-full border p-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.name && (
          <span className="text-red-500 text-sm mt-1">
            {errors.name.message}
          </span>
        )}
      </div>

      <PicturePicker register={register} existingImageUrl={existingImageUrl} />

      <TagsSection
        onTagsSelected={handleTagsChange}
        initialTags={initialTags}
      />

      <Label className="block font-medium">Prep time</Label>
      <input
        type="number"
        {...register("prepTime", { min: 0, valueAsNumber: true })}
        className={`w-full border p-2 rounded ${errors.prepTime ? "border-red-500" : "border-gray-300"}`}
      />

      <Label className="block font-medium">Cook time</Label>
      <input
        type="number"
        {...register("cookTime", { min: 0, valueAsNumber: true })}
        className={`w-full border p-2 rounded ${errors.cookTime ? "border-red-500" : "border-gray-300"}`}
      />

      <Label className="block font-medium">Yield</Label>
      <input
        {...register("yield", {})}
        className={`w-full border p-2 rounded ${errors.yield ? "border-red-500" : "border-gray-300"}`}
      />

      <Label className="block font-medium">Description</Label>
      <textarea
        {...register("description")}
        className="w-full border p-2 rounded border-gray-300"
      />

      <div className="space-y-2">
        <Label className="block font-medium">Ingredients</Label>
        {ingredientFields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-2"
            draggable
            onDragStart={() => (dragIndexIngredients.current = index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveIngredient(dragIndexIngredients.current, index)}
          >
            <GripVertical className="text-muted-foreground self-center shrink-0" />
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

      <div className="space-y-2">
        <Label className="block font-medium">Directions</Label>
        {directionFields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-2"
            draggable
            onDragStart={() => (dragIndexDirections.current = index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => moveDirection(dragIndexDirections.current, index)}
          >
            <GripVertical className="text-muted-foreground self-center shrink-0" />
            <div className="flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-full h-10 w-10 shrink-0 mt-1">
              {index + 1}
            </div>
            <input
              {...register(`directions.${index}.step` as const)}
              className="flex-1 border p-2 rounded"
              placeholder="e.g. Chop onions"
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

      <Label className="block font-medium">Source</Label>
      <input
        id="source"
        {...register("source", {})}
        className={`w-full border p-2 rounded ${errors.yield ? "border-red-500" : "border-gray-300"}`}
      />

      <Button type="submit">Save Changes</Button>
    </form>
  );
};

export default EditRecipePage;
