import * as React from "react";
import { GlobalStateContext } from "./Contexts";
import { useRef, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ADDRESS, Job } from "./lib/server";
import { Table } from "@tanstack/react-table";
import { io, Socket } from "socket.io-client";

export type TColumns = {
  id: string;
  label: string;
  isActive: boolean;
}[];

const Gsources = [
  {
    source: "Job.com",
    isActive: true,
  },
  {
    source: "Indeed",
    isActive: true,
  },
];

export type TSources = typeof Gsources;

export interface GlobalState {
  searchInputRef: React.RefObject<HTMLInputElement>;
  sources: TSources;
  setSources: (sources: TSources) => void;
  daysOfDataValue: number[];
  setDaysOfDataValue: (daysOfData: number[]) => void;
  columns: TColumns;
  setColumns: (columns: TColumns) => void;
  form: UseFormReturn<
    {
      columns: string[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    undefined
  >;
  jobs: Job[] | null;
  setJobs: (jobs: Job[] | null) => void;
  jobsError: string | null;
  setJobsError: (error: string | null) => void;
  jobsLoading: boolean;
  setJobsLoading: (loading: boolean) => void;
  summaryEnabled: boolean;
  setSummaryEnabled: (summaryEnabled: boolean) => void;
  summary: string | null;
  setSummary: (jobs: string | null) => void;
  summaryError: string | null;
  setSummaryError: (error: string | null) => void;
  summaryLoading: boolean;
  setSummaryLoading: (loading: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: (theme: "light" | "dark") => void;
  pagination: TPagination | null;
  setPagination: (pagination: TPagination | null) => void;
  searchId: string | null;
  setSearchId: (searchId: string | null) => void;
  jobOverlayOpen: boolean;
  setJobOverlayOpen: (jobOverlayOpen: boolean) => void;
  activeJob: Job | null;
  activeJobLoading: boolean;
  activeJobError: string | null;
  setActiveJobLoading: (activeJobLoading: boolean) => void;
  setActiveJobError: (error: string | null) => void;
  setActiveJob: (job: Job | null) => void;
  readMoreActive: boolean;
  setReadMoreActive: (readMoreActive: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTable: (table: Table<any> | null) => void;
  socket: Socket;
  tables: TTable[];
  setTables: (tables: TTable[]) => void;
  messages: TMessages;
  setMessages: React.Dispatch<React.SetStateAction<TMessages>>;
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
  scrolledToBottom: boolean;
  setScrolledToBottom: (scrolledToBottom: boolean) => void;
}

type TTable = {
  messageIndex: number;
  table: Job[];
};

export type TMessages = { role: "user" | "assistant"; content: string }[];
type TPagination = {
  currentPage: number;
  pageSize: number;
  totalResults: number;
};
const FormSchema = z.object({
  columns: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});
export type TFormSchema = z.infer<typeof FormSchema>;

type TTheme = "light" | "dark";
export function Providers({ children }: { children: React.ReactNode }) {
  const localStorageTheme = localStorage.getItem("theme");
  const localStorageThemeAsTheme = localStorageTheme as TTheme | null;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      columns: ["recents", "home"],
    },
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sources, setSources] = React.useState<TSources>([]);

  const [daysOfDataValue, setDaysOfDataValue] = React.useState<number[]>([3]);
  const [searchId, setSearchId] = React.useState<string | null>(null);

  const [pagination, setPagination] = React.useState<TPagination | null>(null);

  function toggleTheme(theme: TTheme) {
    if (theme == "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  }

  const [jobs, setJobs] = useState<Job[] | null>([]);
  const [messages, setMessages] = useState<TMessages>([]);
  const [tables, setTables] = useState<TTable[]>([]);
  const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);
  const [chatId, setChatId] = useState<string | null>(null);

  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [readMoreActive, setReadMoreActive] = useState<boolean>(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryEnabled, setSummaryEnabled] = useState<boolean>(false);
  const [jobOverlayOpen, setJobOverlayOpen] = useState<boolean>(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [activeJobLoading, setActiveJobLoading] = useState<boolean>(false);
  const [activeJobError, setActiveJobError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [table, setTable] = useState<Table<any> | null>(null);

  const [columns, setColumns] = useState<TColumns>([]);
  const [theme, setTheme] = useState<"light" | "dark">(
    localStorageThemeAsTheme || "light",
  );

  React.useEffect(() => {
    if (localStorageTheme) {
      const localStorageThemeAsTheme = localStorageTheme as TTheme;
      setTheme(localStorageThemeAsTheme);
      console.log("Theme is: ", theme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socket = io(ADDRESS);
  socket.on("connect", () => {
    console.log("Connected to Socket Server");
  });

  return (
    <GlobalStateContext.Provider
      value={{
        searchInputRef,
        sources,
        setSources,
        daysOfDataValue,
        setDaysOfDataValue,
        columns,
        setColumns,
        form,
        jobs,
        setJobs,
        jobsError,
        setJobsError,
        jobsLoading,
        setJobsLoading,
        summary,
        setSummary,
        summaryError,
        setSummaryError,
        summaryLoading,
        setSummaryLoading,
        theme,
        setTheme,
        toggleTheme,
        summaryEnabled,
        setSummaryEnabled,
        pagination,
        setPagination,
        searchId,
        setSearchId,
        jobOverlayOpen,
        setJobOverlayOpen,
        activeJob,
        activeJobLoading,
        activeJobError,
        setActiveJobLoading,
        setActiveJobError,
        setActiveJob,
        readMoreActive,
        setReadMoreActive,
        table,
        setTable,
        socket,
        messages,
        setMessages,
        chatId,
        setChatId,
        scrolledToBottom,
        setScrolledToBottom,
        tables,
        setTables,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
