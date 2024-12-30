import { on } from "events";
import { Job, PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
async function SeedDatabase() {
  const freelancerData = (
    JSON.parse(
      fs.readFileSync(
        "./datasets/freelancer/overallJobDataFreelancerv2-condensed.json",
        "utf8",
      ),
    ) as {
      id: string;
      experience: string;
      timePosted: string;
      type: string;
      compensation: string;
      description: string;
      link: string;
      title: string;
      company: string;
      location: string;
    }[]
  ).map((data) => {
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
  const upworkData = (
    JSON.parse(
      fs.readFileSync(
        "./datasets/upwork/overallJobDataUpworkv2-condensed.json",
        "utf8",
      ),
    ) as {
      id: string;
      experience: string;
      timePosted: string;
      type: string;
      compensation: string;
      description: string;
      link: string;
      title: string;
      company: string;
      location: string;
    }[]
  ).map((data) => {
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
    const result = await prisma.job.createMany({
      data: combinedData,
      skipDuplicates: true,
    });

    console.log("Written data to database");
  } catch (error) {
    console.log((error as Error).message);
  }
}

async function createVectorizer() {
  try {
    await prisma.$executeRaw`
  SELECT ai.create_vectorizer(
    'public."Job"'::regclass,
    embedding => ai.embedding_openai('text-embedding-3-small', 1536, api_key_name => 'OPENAI_API_KEY'),
    chunking => ai.chunking_recursive_character_text_splitter('description'),
    formatting => ai.formatting_python_template('title: $title description: $chunk, source: $source, company: $company, city: $city, state: $state, link: $link, experienceLevel: $experienceLevel, compensation: $compensation')
  );
`;
    console.log("Created vectorizer successfully");
  } catch (error) {
    console.log((error as Error).message);
  }
}

SeedDatabase();
