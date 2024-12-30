import { cn } from "@/lib/utils";

import {
  ColumnDef,
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
import { useContext } from "react";
import { GlobalStateContext } from "@/Contexts";
import { Skeleton } from "./ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | null;
}

export function JobTable<TData, TValue>({
  columns,
  data,
  className,
}: DataTableProps<TData, TValue> & { className: string }) {
  const { table, setTable } = useContext(GlobalStateContext)!;
  const tableData = data || [];
  setTable(
    useReactTable({
      data: tableData,
      columns,
      getCoreRowModel: getCoreRowModel(),
    }),
  );

  return !table ? (
    <Skeleton className="w-full min-h-96 h-full" />
  ) : (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6 rounded-md border",
        className,
      )}
    >
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
                  <TableCell
                    className="cursor-pointer"
                    key={cell.id}
                    onClick={() => {
                      // setActiveJob(row.original);
                      // setJobOverlayOpen(true);
                    }}
                  >
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
        </TableBody>
      </Table>
      {/* <Pagination /> */}
    </div>
  );
}
