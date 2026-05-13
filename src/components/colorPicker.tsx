import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // shadcn helper for conditional classes

const COLORS = [
  { name: "black", bg: "bg-black" },
  { name: "red", bg: "bg-red-500" },
  { name: "orange", bg: "bg-orange-500" },
  { name: "yellow", bg: "bg-yellow-500" },
  { name: "green", bg: "bg-green-500" },
  { name: "blue", bg: "bg-blue-500" },
  { name: "purple", bg: "bg-purple-500" },
];

export function ColorPicker({
  onColorSelect,
}: {
  onColorSelect: (name: string) => void;
}) {
  const [selected, setSelected] = useState(COLORS[0].name);

  return (
    <RadioGroup
      value={selected}
      onValueChange={(val) => {
        setSelected(val);
        onColorSelect(val);
      }}
      className="flex flex-wrap gap-1"
    >
      {COLORS.map((color) => (
        <div key={color.name} className="flex items-center">
          <RadioGroupItem
            value={color.name}
            id={color.name}
            className="sr-only" // "sr-only" hides the actual radio button but keeps it accessible
          />
          <Label
            htmlFor={color.name}
            className={cn(
              "h-5 w-5 rounded-full cursor-pointer transition-all border-2 border-transparent",
              color.bg,
              selected === color.name && "ring-2 ring-stone-400 ring-offset-2",
            )}
          />
        </div>
      ))}
    </RadioGroup>
  );
}
