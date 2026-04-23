import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useEffect, useState } from "react";
import type { Tag } from "@/types/supabase";
import { supabase } from "@/clients/supabaseClient";
import { Separator } from "./ui/separator";
import { Badge, type BadgeVariants } from "./ui/badge";
import { Pencil, Plus, X } from "lucide-react";
import CreateTag from "./createTag";
import { Button } from "./ui/button";

type TagsDialogProps = {
  open: boolean;
  closeDialog: () => void;
  saveTags: (tags: Tag[]) => void;
};

const TagsDialog = ({ open, closeDialog, saveTags }: TagsDialogProps) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [appliedTags, setAppliedTags] = useState<Tag[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add categories</DialogTitle>
        </DialogHeader>

        <section>Currently applied tags</section>
        {appliedTags.length === 0 ? (
          <div>None</div>
        ) : (
          <section className="flex flex-wrap gap-1">
            {" "}
            {appliedTags
              .sort((a, b) =>
                a.name !== null && b.name !== null
                  ? a.name.localeCompare(b.name)
                  : 0,
              )
              .map((tag) => {
                return (
                  <Badge
                    key={tag.id}
                    variant={
                      (tag.color as BadgeVariants["variant"]) ?? "default"
                    }
                    onClick={() => {
                      setAppliedTags(
                        appliedTags.filter((t) => t.id !== tag.id),
                      );
                      setAvailableTags([...availableTags, tag]);
                    }}
                  >
                    <X />
                    {tag.name}
                  </Badge>
                );
              })}
          </section>
        )}
        <Separator />
        <section>Available tags</section>

        <section className="flex flex-wrap gap-1">
          {availableTags
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
                    setAppliedTags([...appliedTags, tag]);
                    setAvailableTags(
                      availableTags.filter((t) => t.id !== tag.id),
                    );
                  }}
                >
                  <Plus />
                  {tag.name}
                </Badge>
              );
            })}
        </section>
        {creatingTag ? (
          <CreateTag
            triggerUpdate={(newTag: Tag) =>
              setAvailableTags([...availableTags, newTag])
            }
          />
        ) : (
          <Badge
            variant="default"
            onClick={() => {
              setCreatingTag(!creatingTag);
            }}
          >
            <Pencil />
            Create new tag
          </Badge>
        )}

        <DialogFooter>
          <Button
            onClick={() => {
              saveTags(appliedTags);
              closeDialog();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagsDialog;
