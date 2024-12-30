/* eslint-disable @typescript-eslint/no-unused-vars */
import { clsx, type ClassValue } from "clsx";
import { NavigateFunction } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const PRIMARY_COLOR = "hsl(164, 86%, 16%)";
export const PRIMARY_COLOR_HEX = "#064c39";
export const INACTIVE_THRESHOLD = 120000;

export const COLOR_PALLETE = [
  "hsl(173, 58%, 39%)",
  "hsl(43, 74%, 66%)",
  "hsl(197, 37%, 24%)",
  "hsl(27, 87%, 67%)",
  "hsl(12, 76%, 61%)",
  "hsl(186, 55%, 42%)",
  "hsl(47, 70%, 63%)",
  "hsl(202, 35%, 26%)",
  "hsl(30, 83%, 64%)",
  "hsl(14, 70%, 58%)",
  "hsl(165, 60%, 40%)",
  "hsl(50, 72%, 65%)",
  "hsl(210, 34%, 28%)",
  "hsl(33, 85%, 62%)",
  "hsl(16, 74%, 59%)",
];

export function navigateUtil(
  searchParams: URLSearchParams,
  sources: { source: string; isActive: boolean }[],
  columns: { id: string; label: string; isActive: boolean }[],
  daysOfDataValue: number[],
  navigate: NavigateFunction,
  addons: string = "",
) {
  const searchTerm = searchParams.get("term");
  const stringifiedSources = encodeURIComponent(JSON.stringify(sources));
  const stringifiedColumns = encodeURIComponent(JSON.stringify(columns));
  const stringifiedDaysOfData = encodeURIComponent(
    JSON.stringify(daysOfDataValue),
  );

  // const params = new URLSearchParams();
  // params.set("term", searchTerm || "");
  // params.set("sources", stringifiedSources);
  // params.set("columns", stringifiedColumns);
  // params.set("daysOfData", stringifiedDaysOfData);
  //
  // setSearchParams(params, {
  //   preventScrollReset: true,
  // });
  navigate(
    `/jobs?term=${searchTerm || ""}&sources=${stringifiedSources}&columns=${stringifiedColumns}&daysOfData=${stringifiedDaysOfData}${addons}`,
  );
}
