import { useEffect, useState } from "react";
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

export function TagsSection() {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from("tags").select("*");
      if (error) {
        console.log("error fetching tags", error);
      } else {
        if (data !== null) {
          console.log("data", data);
          setAvailableTags(data);
        }
      }
    }
    fetchTags();
  }, []);

  console.log("availableTags", availableTags);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Select tags to apply</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={availableTags} />
      </CardContent>
    </Card>
  );
}
