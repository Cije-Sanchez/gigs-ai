import { Job } from "@/lib/server";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "compensation",
    header: "Compensation",
  },
  {
    accessorKey: "timePosted",
    header: "Duration/Time Posted",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "link",
    header: "Link",
  },
];
