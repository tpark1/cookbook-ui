import { useCallback, useEffect, useMemo, useState } from "react";
import { type Tag } from "../types/supabase";
import { supabase } from "@/clients/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { DataTable } from "./tagsTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "./ui/checkbox";

type TagsSectionProps = {
  initialTags: number[];
  onTagsSelected: (tags: Tag[]) => void;
};

const columns: ColumnDef<Tag>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  // TODO add column showing how many other recipes have this tag maybe
];

export function TagsSection({ initialTags, onTagsSelected }: TagsSectionProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  console.log("initialTags", initialTags);

  const fetchTags = useCallback(async () => {
    const { data, error } = await supabase.from("tags").select("*");
    if (error) {
      console.log("error fetching tags", error);
    } else {
      if (data !== null) {
        console.log("data", data);
        setAvailableTags(data);
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchTags();
    };
    load();
  }, [fetchTags]);

  const initialRowSelection = useMemo(() => {
    const selection: Record<string, boolean> = {};

    if (!availableTags.length || !initialTags.length) return selection;

    availableTags.forEach((tag, index) => {
      if (initialTags.includes(tag.id)) {
        selection[index] = true;
      }
    });

    return selection;
  }, [availableTags, initialTags]);

  const saveTag = async (tagName: string) => {
    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: tagName }])
      .select();

    if (error) {
      console.error("Error creating tag:", error.message);
    } else {
      console.log("Success! Saved:", data);
      fetchTags();
    }
  };

  console.log("availableTags", availableTags);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Select tags to apply</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={availableTags}
          initialRowSelection={initialRowSelection}
          onCreateTag={saveTag}
          onSelectionChange={onTagsSelected}
        />
      </CardContent>
    </Card>
  );
}
