import { Job, PrismaClient } from "@prisma/client";
import { mockSearchJobs } from "../app/utils/model";
const prisma = new PrismaClient();

async function testSearchJobs() {
  const jobs = await mockSearchJobs(prisma);
  console.log(
    jobs.filter((job: any) => {
      const allowedIds = [20, 170, 221, 324, 338];
      return allowedIds.includes(job.id);
    }),
  );
}

testSearchJobs();
