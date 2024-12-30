import { GlobalStateContext } from "@/Contexts";
import { useContext } from "react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";

export function SingleJobDescription() {
  const { activeJob, activeJobLoading, activeJobError } =
    useContext(GlobalStateContext)!;
  return (
    <div className="py-8">
      <Label htmlFor="description">Description</Label>
      {activeJobLoading ? (
        <Skeleton className="w-24 h-24" />
      ) : activeJobError ? (
        <>
          <p className="text-destructive">{activeJobError}</p>
        </>
      ) : (
        <>
          <p id="description">{activeJob && activeJob.description}</p>
        </>
      )}
    </div>
  );
}
