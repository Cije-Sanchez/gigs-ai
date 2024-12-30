import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSparkles } from "./Icons";
import { useContext } from "react";
import { GlobalStateContext } from "@/Contexts";
import { Loading } from "./LoadingAndErrorStates/Loading";
import { Error } from "./LoadingAndErrorStates/Error";
import { MemoizedSummary } from "./MemoizedReactMarkdown";
import truncate from "truncate";

export function AISummaryCard() {
  const TRUNCATED_MAX_LENGTH = 350;
  const {
    summary,
    summaryLoading,
    summaryError,
    readMoreActive,
    setReadMoreActive,
  } = useContext(GlobalStateContext)!;

  function TruncateSummary(summary: string | null) {
    if (!summary) return "";
    return truncate(summary, TRUNCATED_MAX_LENGTH);
  }

  function handleReadMoreClick(): void {
    setReadMoreActive(true);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex gap-2 items-center">
            <div>AI Summary </div>
            <IconSparkles />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summaryLoading ? (
          <Loading />
        ) : summaryError ? (
          <Error error={"Error fetching summary"} />
        ) : readMoreActive ? (
          <>
            <MemoizedSummary summary={summary || ""} />
          </>
        ) : (
          <>
            <MemoizedSummary summary={TruncateSummary(summary) || ""} />
          </>
        )}
      </CardContent>
      {summaryLoading ? (
        <></>
      ) : summaryError ? (
        <></>
      ) : summary && summary.length > TRUNCATED_MAX_LENGTH && readMoreActive ? (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReadMoreClick}>
            Read more
          </Button>
        </CardFooter>
      ) : (
        <></>
      )}
    </Card>
  );
}
