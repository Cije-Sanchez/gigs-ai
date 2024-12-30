import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <div className="min-h-24 h-full">
      <Skeleton className="h-full min-h-24 w-full" />
    </div>
  );
}
