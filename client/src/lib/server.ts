import { TMessages } from "@/GlobalState";
import axios from "axios";

export const ADDRESS = "https://4258-13-51-109-95.ngrok-free.app";
export type TSummaryContext = {
  context: string;
  prompt: string;
  totalResults: number;
  currentPage: number;
  resultsInPage: number;
};
export type Job = {
  id: number;
  title: string;
  description: string;
  source: string;
  company: string;
  city: string;
  state: string;
  link: string;
  timePosted: Date;
  experienceLevel: string;
  compensation: number;
};
type TGetJobsResponse = {
  error: string | null;
  summaryContext: TSummaryContext | null;
  jobs: Job[] | null;
  page: number | null;
  pageSize: number | null;
  totalResults: number | null;
  searchId: string | null;
};

export async function getJobsServer(prompt: string): Promise<TGetJobsResponse> {
  try {
    const response = await axios.post(`${ADDRESS}/search_jobs`, {
      prompt,
    });
    if (response.status == 200) {
      const responseData = response.data as TGetJobsResponse;
      return responseData;
    } else if (response.status == 500) {
      const responseData = response.data as TGetJobsResponse;
      if (!responseData.error) throw new Error("Server issue");
      throw new Error(responseData.error);
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TGetJobsResponse = {
      error: catchError.message,
      summaryContext: null,
      jobs: null,
      page: null,
      pageSize: null,
      totalResults: null,
      searchId: null,
    };
    return response;
  }
}

type TGetJobsSummaryResponse = {
  summary: string | null;
  error: string | null;
};
export async function getSummaryServer(
  summaryContext: TSummaryContext,
): Promise<TGetJobsSummaryResponse> {
  try {
    const response = await axios.post(`${ADDRESS}/get_summary`, {
      summaryContext,
    });
    if (response.status == 200) {
      const responseData = response.data as TGetJobsSummaryResponse;
      return responseData;
    } else if (response.status == 500) {
      const responseData = response.data as TGetJobsSummaryResponse;
      if (!responseData.error) throw new Error("Server issue");
      throw new Error(responseData.error);
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TGetJobsSummaryResponse = {
      error: catchError.message,
      summary: null,
    };
    return response;
  }
}

type SourceFilter = string[];
type DaysofDataFilter = number;

type TPageResponse = TGetJobsResponse;
export async function getPageServer(
  searchId: string,
  page: number,
  pageSize: number,
  totalResults: number,
  query: string,
  sourceFilter: SourceFilter,
  daysofDataFilter: DaysofDataFilter,
): Promise<TPageResponse> {
  try {
    const response = await axios.post(`${ADDRESS}/get_page`, {
      searchId,
      page,
      pageSize,
      totalResults,
      query,
      sourceFilter,
      daysofDataFilter,
    });
    if (response.status == 200) {
      const responseData = response.data as TPageResponse;
      return responseData;
    } else if (response.status == 500) {
      const responseData = response.data as TPageResponse;
      if (!responseData.error) throw new Error("Server issue");
      throw new Error(responseData.error);
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TPageResponse = {
      error: catchError.message,
      summaryContext: null,
      jobs: null,
      page: null,
      pageSize: null,
      totalResults: null,
      searchId: null,
    };
    return response;
  }
}

type TCreateMessageResponse = {
  chatID: string | null;
  error: string | null;
  messages: TMessages | null;
  searchResults: Job[] | null;
};
export async function createMessageServer(
  chatID: string,
  messages: TMessages,
  sourceFilter: SourceFilter,
  daysofDataFilter: DaysofDataFilter,
): Promise<TCreateMessageResponse> {
  try {
    const response = await axios.post(`${ADDRESS}/api/chat/createMessage`, {
      chatID,
      messages,
      sourceFilter,
      daysofDataFilter,
    });
    if (response.status == 200) {
      const responseData = response.data as TCreateMessageResponse;
      return responseData;
    } else if (response.status == 505) {
      const responseData = response.data as TCreateMessageResponse;
      if (!responseData.error) throw new Error("Server issue");
      throw new Error(responseData.error);
    } else {
      throw new Error("Server issue");
    }
  } catch (error) {
    const catchError = error as Error;
    const response: TCreateMessageResponse = {
      error: catchError.message,
      chatID: null,
      messages: null,
      searchResults: null,
    };
    return response;
  }
}
