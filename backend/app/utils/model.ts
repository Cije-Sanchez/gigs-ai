import OpenAI from "openai";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client/extension";
import { randomUUID } from "crypto";
import {
  Job,
  Job_embedding_store,
  public_Job_embedding_v3_store,
} from "@prisma/client";
dotenv.config();

export function getModel(openai_key: string) {
  if (openai_key == "self") {
    return new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  } else {
    return new OpenAI({
      apiKey: openai_key,
    });
  }
}

export async function generatePromptResponse(
  openai: OpenAI,
  systemMessage: string,
  userMessages: string[],
  model: string = "gpt-4o-mini",
  userSystemMixedMessages:
    | { role: "system" | "user"; content: string }[]
    | null = null,
): Promise<string | null> {
  const userMessagesPresented = userMessages.map((userMessage) => {
    return {
      role: "user",
      content: userMessage,
    } as const;
  });

  const systemMessagePresented = {
    role: "system",
    content: systemMessage,
  } as const;

  let messages: { role: "system" | "user"; content: string }[];
  if (userSystemMixedMessages) {
    const mixedMessages = userSystemMixedMessages.map((mixedMessage) => {
      return {
        role: mixedMessage.role,
        content: mixedMessage.content,
      } as const;
    });
    messages = mixedMessages;
  } else {
    messages = [systemMessagePresented, ...userMessagesPresented];
  }

  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_completion_tokens: 600,
  });

  const generation = completion.choices[0].message.content;
  return generation;
}

async function generateEmbedding(raw: string, model: OpenAI) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, " ");
  const embeddingData = await model.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}

export type SourceFilter = string[];
export type DaysofDataFilter = number;
export async function searchJobs(
  query: string,
  model: OpenAI,
  prisma: PrismaClient,
  page: number,
  pageSize: number,
  vectorQueryCached: string | null,
  sourceFilter?: SourceFilter | null,
  daysofDataFilter?: DaysofDataFilter | null,
): Promise<{
  jobs: Array<public_Job_embedding_v3_store & { similarity: number } & Job>;
  totalCount: number;
  searchId: string | null;
}> {
  try {
    if (query.trim().length === 0)
      return {
        jobs: [],
        totalCount: 0,
        searchId: null,
      };

    let vectorQuery: string;
    let newSearchId: string | null = null;
    if (vectorQueryCached) {
      vectorQuery = vectorQueryCached;
    } else {
      const embedding = await generateEmbedding(query, model);
      vectorQuery = `[${embedding.join(",")}]`;
      newSearchId = randomUUID();
      await prisma.searchEmbeddingCache.create({
        data: {
          searchEmbedding: vectorQuery,
          searchId: newSearchId,
        },
      });
    }

    let jobs;
    if (!false) {
      jobs = await prisma.$queryRaw`
  SELECT DISTINCT ON ("public.Job_embedding_v3_store".id)
        "public.Job_embedding_v3_store"."id",
        "public.Job_embedding_v3_store"."chunk",
        "public.Job_embedding_v3_store"."chunk_seq",
        1 - ("public.Job_embedding_v3_store"."embedding" <=> ${vectorQuery}::vector) as similarity,
        "Job".*
      FROM "public.Job_embedding_v3_store"
      INNER JOIN "Job"
        ON "public.Job_embedding_v3_store"."id" = "Job"."id"
      WHERE 1 - ("public.Job_embedding_v3_store"."embedding" <=> ${vectorQuery}::vector) > 0.1
  ORDER BY "public.Job_embedding_v3_store".id, similarity DESC
  LIMIT ${5} OFFSET ${(page - 1) * pageSize};
    `;
    } else {
      jobs = await prisma.$queryRaw`
  SELECT DISTINCT ON ("public.Job_embedding_v3_store".id)
        "public.Job_embedding_v3_store"."id",
        "public.Job_embedding_v3_store"."chunk",
        "public.Job_embedding_v3_store"."chunk_seq",
        1 - ("public.Job_embedding_v3_store"."embedding" <=> ${vectorQuery}::vector) as similarity,
        "Job".*
      FROM "public.Job_embedding_v3_store"
      INNER JOIN "Job"
        ON "public.Job_embedding_v3_store"."id" = "Job"."id"
      WHERE 1 - ("public.Job_embedding_v3_store"."embedding" <=> ${vectorQuery}::vector) > 0.1
        AND ("Job"."source" = ANY(${sourceFilter})) -- Filter by source
        AND ("Job"."timePosted" >= NOW() - INTERVAL '${daysofDataFilter} days') -- Filter by number of days
  ORDER BY "public.Job_embedding_v3_store".id, similarity DESC
  LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
`;
    }

    const totalCount = Number(10);
    return {
      jobs: jobs,
      totalCount,
      searchId: newSearchId,
    };
  } catch (error) {
    throw error;
  }
}

export const mockSearchJobs = async (prisma: PrismaClient) => {
  try {
    const jobsWithReact = await prisma.job.findMany({
      where: {
        OR: [
          {
            description: {
              contains: "React",
              mode: "insensitive", // Makes the search case-insensitive
            },
          },
          {
            title: {
              contains: "React",
              mode: "insensitive", // Makes the search case-insensitive
            },
          },
        ],
      },
    });

    if (!jobsWithReact) throw "Jobs with react null";
    console.log(jobsWithReact);

    const desiredJobs = jobsWithReact
      .filter((job: any) => {
        const allowedIds = [20, 170, 221, 324, 338];
        return allowedIds.includes(job.id);
      })
      .map((job: any) => {
        const chunk = `'title: ${job.title} description: ${extractFirstNCharacters(job.description, 833)}, source: ${job.source}, company: ${job.company}, location: ${job.location},  link: ${job.link}, experienceLevel: ${job.experienceLevel}, compensation: ${job.compensation}'`;
        return {
          ...job,
          chunk,
        };
      });
    return desiredJobs;
  } catch (e) {
    console.log((e as Error).message);
  }
};

function extractFirstNCharacters(input: string, n: number): string {
  if (n < 0) {
    throw new Error("n must be a non-negative number");
  }
  return input.length <= n ? input : input.substring(0, n);
}
