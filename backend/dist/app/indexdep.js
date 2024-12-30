"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { Job, PrismaClient } from "@prisma/client";
// import express from "express";
// import cors from "cors";
// import { generatePromptResponse, getModel, searchJobs } from "./utils/model";
// import OpenAI from "openai";
// import dotenv from "dotenv";
// import {
//   generateRAG_USER_MESSAGE,
//   MAX_USER_TRIALS,
//   RAG_SYSTEM_PROMPT,
// } from "./utils/prompts";
// import { randomUUID } from "crypto";
//
// const PAGE_SIZE = 10;
// dotenv.config();
// const prisma = new PrismaClient();
// const app = express();
//
// app.use(express.json());
// app.use(cors());
//
// app.get(`/ping`, async (req, res) => {
//   try {
//     return res.send("We are live");
//   } catch (error) {
//     return res.json({ message: "Error" });
//   }
// });
//
// // app.get(`/test`, async (req, res) => {
// //   try {
// //     const openai = getModel("self");
// //     const jobs = await searchJobs("job", openai, prisma, 1, 10);
// //     res.json(jobs);
// //   } catch (error) {
// //     const catchError = error as Error;
// //     const response: TGetJobsResponse = {
// //       jobs: null,
// //       summaryContext: null,
// //       error: catchError.message,
// //     };
// //     res.status(505).json(response);
// //   }
// // });
//
// type Message = {
//   role: string | null;
//   content: string | null;
//   tableData: Job[] | null;
// };
// app.post(`/handle_message`, async (req, res) => {
//   try {
//     const { client_messages, userId } = req.body;
//     const messages = client_messages as Message[] | null;
//
//     if (!messages) throw new Error("Messages is null");
//     if (!(messages[messages.length - 1].role == "user"))
//       throw new Error("The last message is a system message");
//
//     const query = messages
//       .filter((message) => message.role == "user" && message.content)
//       .map((message) => message.content)
//       .join("  ");
//
//     const currentPage = 1;
//     const openai = getModel("self");
//
//     const { jobs } = await searchJobs(
//       query,
//       openai,
//       prisma,
//       currentPage,
//       PAGE_SIZE,
//       null,
//     );
//   } catch (error) {
//     const catchError = error as Error;
//     const response: TGetJobsResponse = {
//       jobs: null,
//       summaryContext: null,
//       error: catchError.message,
//       page: null,
//       pageSize: null,
//       totalResults: null,
//       searchId: null,
//     };
//     res.status(505).json(response);
//   }
// });
//
// type TGetJobsResponse = {
//   error: string | null;
//   summaryContext: TSummaryContext | null;
//   jobs: Job[] | null;
//   page: number | null;
//   pageSize: number | null;
//   totalResults: number | null;
//   searchId: string | null;
// };
//
// app.post(`/search_jobs`, async (req, res) => {
//   try {
//     const { prompt } = req.body;
//
//     if (!prompt) throw new Error("Prompt is null");
//
//     const cacheQuery = `${prompt}`;
//     const possibleCache = await checkSearchCache(cacheQuery);
//     if (possibleCache) {
//       console.log("Using Cache");
//       return res.status(200).json(possibleCache);
//     }
//     const currentPage = 1;
//     const openai = getModel("self");
//     console.log("Using Search Jobs");
//     const searchJobsReturnValue = await searchJobs(
//       prompt,
//       openai,
//       prisma,
//       currentPage,
//       PAGE_SIZE,
//       null,
//     );
//     const count = searchJobsReturnValue.totalCount;
//     const searchId = searchJobsReturnValue.searchId;
//     if (!searchId) throw new Error("Could not generate Search ID");
//     const jobEmbeddingsSearch = searchJobsReturnValue.jobs;
//     const jobs: Job[] = jobEmbeddingsSearch.map((jobES) => {
//       return {
//         id: jobES.id,
//         description: jobES.description,
//         title: jobES.title,
//         timePosted: jobES.timePosted,
//         source: jobES.source,
//         company: jobES.company,
//         city: jobES.city,
//         state: jobES.state,
//         link: jobES.link,
//         compensation: jobES.compensation,
//         experienceLevel: jobES.experienceLevel,
//         type: jobES.type,
//       };
//     });
//     const summaryContextString = JSON.stringify(
//       jobEmbeddingsSearch.map((jobEs) => {
//         return {
//           id: jobEs.id,
//           chunk: jobEs.chunk,
//           chunk_sequence: jobEs.chunk_seq,
//         };
//       }),
//     );
//
//     const summaryContext: TSummaryContext = {
//       context: summaryContextString,
//       prompt,
//       totalResults: 1,
//       currentPage,
//       resultsInPage: jobs.length,
//     };
//     const response: TGetJobsResponse = {
//       jobs,
//       summaryContext,
//       error: null,
//       page: currentPage,
//       pageSize: jobs.length,
//       totalResults: count,
//       searchId: searchId,
//     };
//     cacheJobs(cacheQuery, response);
//     return res.json(response);
//   } catch (error) {
//     const catchError = error as Error;
//     const response: TGetJobsResponse = {
//       jobs: null,
//       summaryContext: null,
//       error: catchError.message,
//       page: null,
//       pageSize: null,
//       totalResults: null,
//       searchId: null,
//     };
//     res.status(505).json(response);
//   }
// });
//
// type TSummaryContext = {
//   context: string;
//   prompt: string;
//   totalResults: number;
//   currentPage: number;
//   resultsInPage: number;
// };
// type TGetJobsSummaryResponse = {
//   summary: string | null;
//   error: string | null;
// };
// app.post(`/get_summary`, async (req, res) => {
//   try {
//     const { summaryContext } = req.body;
//     if (!summaryContext) throw new Error("Summary Context is empty");
//     const summaryContextObject = summaryContext as TSummaryContext;
//     const cacheQuery = JSON.stringify(summaryContextObject);
//     const possibleSummaryCache = await checkSummaryCache(cacheQuery);
//     if (possibleSummaryCache) {
//       return res.status(200).json(possibleSummaryCache);
//     }
//     const model = getModel("self");
//     const queryPrompt = generateRAG_USER_MESSAGE(
//       summaryContextObject.context,
//       summaryContextObject.prompt,
//       summaryContextObject.totalResults,
//       summaryContextObject.currentPage,
//       summaryContextObject.resultsInPage,
//     );
//     const summary = await generatePromptResponse(model, RAG_SYSTEM_PROMPT, [
//       queryPrompt,
//     ]);
//     if (!summary) throw new Error("Could not generate summary");
//     const response: TGetJobsSummaryResponse = {
//       summary,
//       error: null,
//     };
//     cacheSummary(cacheQuery, response);
//     res.json(response);
//   } catch (error) {
//     const catchError = error as Error;
//     const response: TGetJobsSummaryResponse = {
//       summary: null,
//       error: catchError.message,
//     };
//     res.status(505).json(response);
//   }
// });
//
// type TPageResponse = TGetJobsResponse;
// app.post(`/get_page`, async (req, res) => {
//   try {
//     const {
//       searchId,
//       page,
//       pageSize,
//       totalResults,
//       query,
//       sourceFilter,
//       daysofDataFilter,
//     } = req.body;
//     if (!searchId || !page || !pageSize || !sourceFilter || !daysofDataFilter)
//       throw new Error("Missing body fields");
//     const cacheQuery = `${searchId}${page}${totalResults}${query}${sourceFilter}${daysofDataFilter}${pageSize}`;
//     const possibleCache = await checkSearchCache(cacheQuery);
//     if (possibleCache) {
//       return res.status(200).json(possibleCache);
//     }
//     const embeddingCache = await prisma.searchEmbeddingCache.findFirst({
//       where: {
//         searchId,
//       },
//     });
//     if (!embeddingCache)
//       throw new Error("Could not find embeddings for Search ID");
//     const embedding = embeddingCache.searchEmbedding;
//     const openai = getModel("self");
//     const { jobs } = await searchJobs(
//       query,
//       openai,
//       prisma,
//       page,
//       pageSize,
//       embedding,
//       sourceFilter,
//       daysofDataFilter,
//     );
//     const jobMapping: Job[] = jobs.map((jobES) => {
//       return {
//         id: jobES.id,
//         description: jobES.description,
//         title: jobES.title,
//         timePosted: jobES.timePosted,
//         source: jobES.source,
//         company: jobES.company,
//         city: jobES.city,
//         state: jobES.state,
//         link: jobES.link,
//         compensation: jobES.compensation,
//         experienceLevel: jobES.experienceLevel,
//         type: jobES.type,
//       };
//     });
//     const summaryContextString = JSON.stringify(
//       jobs.map((jobEs) => {
//         return {
//           id: jobEs.id,
//           chunk: jobEs.chunk,
//           chunk_sequence: jobEs.chunk_seq,
//         };
//       }),
//     );
//
//     const summaryContext: TSummaryContext = {
//       context: summaryContextString,
//       prompt: query,
//       totalResults: totalResults,
//       currentPage: page,
//       resultsInPage: pageSize,
//     };
//     const response: TGetJobsResponse = {
//       jobs: jobMapping,
//       summaryContext,
//       error: null,
//       page,
//       pageSize,
//       totalResults,
//       searchId,
//     };
//     cacheJobs(cacheQuery, response);
//     return res.json(response);
//   } catch (error) {
//     const catchError = error as Error;
//     const response: TPageResponse = {
//       jobs: null,
//       summaryContext: null,
//       error: catchError.message,
//       page: null,
//       pageSize: null,
//       totalResults: null,
//       searchId: null,
//     };
//     res.status(505).json(response);
//   }
// });
//
// app.get(`/vectorize`, async (req, res) => {
//   try {
//     const jobs = await prisma.job.findMany({});
//     await prisma.$executeRaw`
//   SELECT ai.create_vectorizer(
//     '"Job"'::regclass,
//     embedding => ai.embedding_openai('text-embedding-3-small', 1536, api_key_name => 'OPENAI_API_KEY'),
//     chunking => ai.chunking_recursive_character_text_splitter('description'),
//     formatting => ai.formatting_python_template('title: $title description: $chunk, source: $source, job_type: $type  location: $location, link: $link, experienceLevel: $experienceLevel, compensation: $compensation')
//   );
// `;
//     res.json(jobs);
//   } catch (error) {
//     const catchError = error as Error;
//     const response: TGetJobsResponse = {
//       jobs: null,
//       summaryContext: null,
//       error: catchError.message,
//       page: null,
//       pageSize: null,
//       totalResults: null,
//       searchId: null,
//     };
//     res.status(505).json(response);
//   }
// });
//
// app.listen(3000, () =>
//   console.log(`
// 🚀 Server ready at: http://localhost:3000
// `),
// );
// async function getUserTrials(userId: any): Promise<number> {
//   try {
//     let userDetails;
//     userDetails = await prisma.user.findFirst({
//       where: {
//         userId,
//       },
//     });
//     if (!userDetails) {
//       userDetails = await prisma.user.create({
//         data: {
//           userId,
//           trials: 0,
//         },
//       });
//     }
//     return userDetails.trials;
//   } catch (error) {
//     return 0;
//   }
// }
// export async function checkUserTrials(userId: any): Promise<boolean> {
//   try {
//     let userDetails;
//     userDetails = await prisma.user.findFirst({
//       where: {
//         userId,
//       },
//     });
//     if (!userDetails) {
//       userDetails = await prisma.user.create({
//         data: {
//           userId,
//           trials: 0,
//         },
//       });
//     }
//     return userDetails.trials <= MAX_USER_TRIALS;
//   } catch (error) {
//     return false;
//   }
// }
//
// export async function updateUserTrials(userId: string) {
//   try {
//     let userDetails;
//     userDetails = await prisma.user.findFirst({
//       where: {
//         userId,
//       },
//     });
//     if (!userDetails) {
//       userDetails = await prisma.user.create({
//         data: {
//           userId,
//           trials: 0,
//         },
//       });
//     }
//     await prisma.user.update({
//       where: {
//         id: userDetails.id,
//       },
//       data: {
//         trials: userDetails.trials + 1,
//       },
//     });
//     console.info("User Trials: ", userDetails.trials);
//   } catch (error) {
//     throw new Error("Failed to update user free trials");
//   }
// }
//
// type TSummaryCacheResponse = TGetJobsSummaryResponse | null;
// async function checkSummaryCache(
//   query: string,
// ): Promise<TSummaryCacheResponse> {
//   try {
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//
//     const cachedResult = await prisma.summaryCache.findFirst({
//       where: {
//         summaryQuey: query,
//         summaryDate: {
//           gte: fiveMinutesAgo,
//         },
//       },
//     });
//
//     if (cachedResult) {
//       const results = JSON.parse(
//         cachedResult.summaryResults,
//       ) as TSummaryCacheResponse;
//       return results;
//     } else {
//       throw new Error("No Cache found");
//     }
//   } catch (error) {
//     const catchError = error as Error;
//     console.log(catchError.message);
//     return null;
//   }
// }
//
// async function cacheSummary(query: string, results: TGetJobsSummaryResponse) {
//   const now = new Date(Date.now());
//   const stringifiedSummaryResponseData = JSON.stringify(results);
//   try {
//     await prisma.summaryCache.create({
//       data: {
//         summaryQuey: query,
//         summaryDate: now,
//         summaryResults: stringifiedSummaryResponseData,
//       },
//     });
//   } catch (error) {
//     const catchError = error as Error;
//     console.error(catchError);
//   }
// }
//
// type TCacheResponse = TPageResponse | null;
// async function checkSearchCache(query: string): Promise<TCacheResponse> {
//   try {
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//
//     const cachedResult = await prisma.searchCache.findFirst({
//       where: {
//         searchQuery: query,
//         searchDate: {
//           gte: fiveMinutesAgo,
//         },
//       },
//     });
//
//     if (cachedResult) {
//       const results = JSON.parse(cachedResult.searchResults) as TPageResponse;
//       return results;
//     } else {
//       throw new Error("No Cache found");
//     }
//   } catch (error) {
//     const catchError = error as Error;
//     console.log(catchError.message);
//     return null;
//   }
// }
//
// async function cacheJobs(query: string, results: TPageResponse) {
//   const now = new Date(Date.now());
//   const stringifiedPageResponseData = JSON.stringify(results);
//   try {
//     await prisma.searchCache.create({
//       data: {
//         searchQuery: query,
//         searchDate: now,
//         searchResults: stringifiedPageResponseData,
//       },
//     });
//   } catch (error) {
//     const catchError = error as Error;
//     console.error(catchError);
//   }
// }
//# sourceMappingURL=indexdep.js.map