"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSearchJobs = exports.searchJobs = exports.generatePromptResponse = exports.getModel = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = require("crypto");
dotenv_1.default.config();
function getModel(openai_key) {
    if (openai_key == "self") {
        return new openai_1.default({
            apiKey: process.env.OPENAI_KEY,
        });
    }
    else {
        return new openai_1.default({
            apiKey: openai_key,
        });
    }
}
exports.getModel = getModel;
function generatePromptResponse(openai, systemMessage, userMessages, model = "gpt-4o-mini", userSystemMixedMessages = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const userMessagesPresented = userMessages.map((userMessage) => {
            return {
                role: "user",
                content: userMessage,
            };
        });
        const systemMessagePresented = {
            role: "system",
            content: systemMessage,
        };
        let messages;
        if (userSystemMixedMessages) {
            const mixedMessages = userSystemMixedMessages.map((mixedMessage) => {
                return {
                    role: mixedMessage.role,
                    content: mixedMessage.content,
                };
            });
            messages = mixedMessages;
        }
        else {
            messages = [systemMessagePresented, ...userMessagesPresented];
        }
        const completion = yield openai.chat.completions.create({
            model,
            messages,
            max_completion_tokens: 600,
        });
        const generation = completion.choices[0].message.content;
        return generation;
    });
}
exports.generatePromptResponse = generatePromptResponse;
function generateEmbedding(raw, model) {
    return __awaiter(this, void 0, void 0, function* () {
        // OpenAI recommends replacing newlines with spaces for best results
        const input = raw.replace(/\n/g, " ");
        const embeddingData = yield model.embeddings.create({
            model: "text-embedding-3-small",
            input,
        });
        const [{ embedding }] = embeddingData.data;
        return embedding;
    });
}
function searchJobs(query, model, prisma, page, pageSize, vectorQueryCached, sourceFilter, daysofDataFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (query.trim().length === 0)
                return {
                    jobs: [],
                    totalCount: 0,
                    searchId: null,
                };
            let vectorQuery;
            let newSearchId = null;
            if (vectorQueryCached) {
                vectorQuery = vectorQueryCached;
            }
            else {
                const embedding = yield generateEmbedding(query, model);
                vectorQuery = `[${embedding.join(",")}]`;
                newSearchId = (0, crypto_1.randomUUID)();
                yield prisma.searchEmbeddingCache.create({
                    data: {
                        searchEmbedding: vectorQuery,
                        searchId: newSearchId,
                    },
                });
            }
            let jobs;
            if (!false) {
                jobs = yield prisma.$queryRaw `
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
            }
            else {
                jobs = yield prisma.$queryRaw `
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
        }
        catch (error) {
            throw error;
        }
    });
}
exports.searchJobs = searchJobs;
const mockSearchJobs = (prisma) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobsWithReact = yield prisma.job.findMany({
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
        if (!jobsWithReact)
            throw "Jobs with react null";
        console.log(jobsWithReact);
        const desiredJobs = jobsWithReact
            .filter((job) => {
            const allowedIds = [20, 170, 221, 324, 338];
            return allowedIds.includes(job.id);
        })
            .map((job) => {
            const chunk = `'title: ${job.title} description: ${extractFirstNCharacters(job.description, 833)}, source: ${job.source}, company: ${job.company}, location: ${job.location},  link: ${job.link}, experienceLevel: ${job.experienceLevel}, compensation: ${job.compensation}'`;
            return Object.assign(Object.assign({}, job), { chunk });
        });
        return desiredJobs;
    }
    catch (e) {
        console.log(e.message);
    }
});
exports.mockSearchJobs = mockSearchJobs;
function extractFirstNCharacters(input, n) {
    if (n < 0) {
        throw new Error("n must be a non-negative number");
    }
    return input.length <= n ? input : input.substring(0, n);
}
//# sourceMappingURL=model.js.map