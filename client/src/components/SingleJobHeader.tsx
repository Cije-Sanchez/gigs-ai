import { GlobalStateContext } from "@/Contexts";
import { MapPinnedIcon } from "lucide-react";
import { useContext } from "react";
import { Skeleton } from "./ui/skeleton";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo("en-US");

export function SingleJobHeader() {
  const { activeJob, activeJobLoading, activeJobError } =
    useContext(GlobalStateContext)!;
  return (
    <div className="flex flex-col gap-4 py-8">
      <div>
        {activeJobLoading ? (
          <Skeleton className="w-24 h-8" />
        ) : activeJobError ? (
          <>
            <p className="text-destructive">{activeJobError}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">
              {activeJob?.title || "Error fetching title"}
            </h2>
          </>
        )}
      </div>
      <div className="flex flex-row gap-6 items-center">
        <div className="text-accent">
          {activeJobLoading ? (
            <Skeleton className="w-24 h-4" />
          ) : activeJobError ? (
            <>
              <p className="text-destructive">{activeJobError}</p>
            </>
          ) : (
            <>
              <p className="">
                {activeJob &&
                  `Posted ${timeAgo.format(new Date(activeJob.timePosted))}`}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <MapPinnedIcon className="text-accent w-4" />
          <div className="text-accent">
            <div>
              {activeJobLoading ? (
                <Skeleton className="w-24 h-4" />
              ) : activeJobError ? (
                <>
                  <p className="text-destructive">{activeJobError}</p>
                </>
              ) : (
                <>
                  <p className="">
                    {activeJob && `${activeJob.city}, ${activeJob.state}`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
