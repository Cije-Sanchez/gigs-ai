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
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
function SeedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const freelancerData = JSON.parse(fs_1.default.readFileSync("./datasets/freelancer/overallJobDataFreelancerv2-condensed.json", "utf8")).map((data) => {
            const newData = {
                jobId: data.id,
                experienceLevel: data.experience,
                timePosted: data.timePosted,
                type: data.type,
                compensation: data.compensation,
                description: data.description,
                link: data.link,
                title: data.title,
                location: data.location,
                source: "Upwork",
            };
            return newData;
        });
        const upworkData = JSON.parse(fs_1.default.readFileSync("./datasets/upwork/overallJobDataUpworkv2-condensed.json", "utf8")).map((data) => {
            const newData = {
                jobId: data.id,
                experienceLevel: data.experience,
                timePosted: data.timePosted,
                type: data.type,
                compensation: data.compensation,
                description: data.description,
                link: data.link,
                title: data.title,
                location: data.location,
                source: "Upwork",
            };
            return newData;
        });
        const combinedData = [...upworkData, ...freelancerData];
        console.log("Length of Combined Data is: ", combinedData.length);
        try {
            const result = yield prisma.job.createMany({
                data: combinedData,
                skipDuplicates: true,
            });
            console.log("Written data to database");
        }
        catch (error) {
            console.log(error.message);
        }
    });
}
function createVectorizer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma.$executeRaw `
  SELECT ai.create_vectorizer(
    'public."Job"'::regclass,
    embedding => ai.embedding_openai('text-embedding-3-small', 1536, api_key_name => 'OPENAI_API_KEY'),
    chunking => ai.chunking_recursive_character_text_splitter('description'),
    formatting => ai.formatting_python_template('title: $title description: $chunk, source: $source, company: $company, city: $city, state: $state, link: $link, experienceLevel: $experienceLevel, compensation: $compensation')
  );
`;
            console.log("Created vectorizer successfully");
        }
        catch (error) {
            console.log(error.message);
        }
    });
}
SeedDatabase();
//# sourceMappingURL=feeder.js.map