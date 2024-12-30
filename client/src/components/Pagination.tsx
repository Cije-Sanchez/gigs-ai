import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useContext } from "react";
import { GlobalStateContext } from "@/Contexts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { navigateUtil } from "@/lib/utils";
import { toast } from "sonner";

export function Pagination() {
  const { pagination, sources, daysOfDataValue, columns } =
    useContext(GlobalStateContext)!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (!pagination) {
    toast.error("Error occured while getting pagination");
    return <div></div>;
  }
  const canGetPreviousPage = pagination.currentPage > 1;
  const canGetNextPage =
    Math.ceil(pagination.totalResults / pagination.pageSize) >
    pagination.currentPage;

  function handleNextPageClicked() {
    if (!pagination) {
      return toast.error("Error occured while getting pagination");
    }
    const pageParam = `&page=${pagination.currentPage + 1}`;
    navigateUtil(
      searchParams,
      sources,
      columns,
      daysOfDataValue,
      navigate,
      pageParam,
    );
  }

  function handleLastPageClicked() {
    if (!pagination) {
      return toast.error("Error occured while getting pagination");
    }
    const pageParam = `&page=${Math.ceil(pagination.totalResults / pagination.pageSize)}`;
    navigateUtil(
      searchParams,
      sources,
      columns,
      daysOfDataValue,
      navigate,
      pageParam,
    );
  }
  function handleFirstPageClicked() {
    if (!pagination) {
      return toast.error("Error occured while getting pagination");
    }
    const pageParam = `&page=${1}`;
    navigateUtil(
      searchParams,
      sources,
      columns,
      daysOfDataValue,
      navigate,
      pageParam,
    );
  }
  function handlePreviousPageClicked() {
    if (!pagination) {
      return toast.error("Error occured while getting pagination");
    }
    const pageParam = `&page=${pagination.currentPage - 1}`;
    navigateUtil(
      searchParams,
      sources,
      columns,
      daysOfDataValue,
      navigate,
      pageParam,
    );
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground"></div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm font-medium">
          {pagination && pagination.totalResults > 0 ? (
            `Page ${pagination.currentPage} of ${Math.ceil(pagination.totalResults / pagination.pageSize)} `
          ) : (
            <></>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPageClicked}
            disabled={!canGetPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPageClicked}
            disabled={!canGetPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPageClicked}
            disabled={!canGetNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPageClicked}
            disabled={!canGetNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
