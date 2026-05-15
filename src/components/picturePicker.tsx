import { useState } from "react";
import type { UseFormRegister } from "react-hook-form";
import { Label } from "./ui/label";
import type { RecipeForm } from "@/pages/newRecipePage";

type PicturePickerProps = {
  register: UseFormRegister<RecipeForm>;
};

export function PicturePicker({ register }: PicturePickerProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const { ref, onChange, ...rest } = register("recipeImage");

  return (
    <div>
      <Label className="block font-medium">Recipe Photo</Label>
      <div className="flex items-center gap-3">
        <label
          htmlFor="recipeImage"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse
        </label>
        <span className="text-sm text-gray-500">
          {fileName ?? "No file chosen"}
        </span>
      </div>
      <input
        id="recipeImage"
        type="file"
        className="hidden"
        onChange={(e) => {
          setFileName(e.target.files?.[0]?.name ?? null);
          onChange(e); // keep RHF in sync
        }}
        ref={ref}
        {...rest}
      />
    </div>
  );
}
