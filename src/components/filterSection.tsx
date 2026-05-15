import { Input } from "@/components/ui/input";
import { supabase } from "@/clients/supabaseClient";
import { useEffect, useState } from "react";
import type { Tag } from "@/types/supabase";

type FilterSectionProps = {
  onFiltersChange: (nameQuery: string, selectedTagIds: number[]) => void;
};

export function FilterSection({ onFiltersChange }: FilterSectionProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [nameQuery, setNameQuery] = useState("");

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from("tags").select("*");
      if (!error && data) setTags(data);
    }
    fetchTags();
  }, []);

  function toggleTag(id: number) {
    const next = selectedTagIds.includes(id)
      ? selectedTagIds.filter((t) => t !== id)
      : [...selectedTagIds, id];
    setSelectedTagIds(next);
    onFiltersChange(nameQuery, next);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNameQuery(e.target.value);
    onFiltersChange(e.target.value, selectedTagIds);
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Input
        placeholder="Search recipes..."
        value={nameQuery}
        onChange={handleNameChange}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
