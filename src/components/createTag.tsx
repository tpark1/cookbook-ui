import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { supabase } from "@/clients/supabaseClient";
import type { Tag } from "@/types/supabase";

type CreateTagProps = {
  triggerUpdate: (tag: Tag) => void;
};

const CreateTag = ({ triggerUpdate }: CreateTagProps) => {
  const [tagName, setTagName] = useState("");

  const saveTag = async () => {
    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: tagName }])
      .select();

    if (error) {
      console.error("Error creating tag:", error.message);
    } else {
      console.log("Success! Saved:", data);
      triggerUpdate(data[0]);
    }
  };

  return (
    <>
      <section className="bg-stone-100 space-y-2 p-2">
        <h1 className="text-xl font-bold">Add New Recipe</h1>
        <Label>Name</Label>
        <input
          autoFocus
          type="text"
          placeholder="New category..."
          className="border p-2 rounded w-full"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
        />
        <Button onClick={saveTag}>Create tag</Button>
      </section>
    </>
  );
};

export default CreateTag;
