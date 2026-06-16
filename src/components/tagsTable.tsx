import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialRowSelection: Record<string, boolean>;
  onCreateTag: (newTag: string) => void;
  onSelectionChange: (selectedRows: TData[]) => void;
}

const coreRowModel = getCoreRowModel();

export function DataTable<TData, TValue>({
  columns,
  data,
  initialRowSelection,
  onCreateTag,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (Object.keys(initialRowSelection).length > 0) {
      setRowSelection(initialRowSelection);
    }
  }, [initialRowSelection]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: coreRowModel,
    onRowSelectionChange: (updater) => {
      // 1. Standard row selection update
      const nextSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(nextSelection);

      // 2. Map the selection IDs back to the actual data objects and notify parent
      if (onSelectionChange) {
        // This gets the actual data objects for the selected rows
        const selectedData = Object.keys(nextSelection).map(
          (index) => data[Number(index)],
        );
        onSelectionChange(selectedData);
      }
    },
    state: {
      rowSelection,
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagName.trim() !== "") {
      onCreateTag(newTagName);
      setNewTagName("");
    }
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}

          <TableRow className="bg-muted/50">
            <TableCell colSpan={columns.length} className="p-2">
              <Input
                placeholder="Type new tag and press Enter..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 border-dashed"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
