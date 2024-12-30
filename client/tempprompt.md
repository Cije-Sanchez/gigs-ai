Gigs AI

- Aggregates data from freelancer.com and upwork.com
- Gets the data every 24 hours with BrightData's scraping browser. The code is located at https://github.com/CijeTheCreator/Paste-to-Replace/blob/main/src/model.ts.
- Overall it takes about 30 seconds to generate
- It is hosted in an amazon EC2 Instance
- The Schema for the gigs is
  model Job {
  id Int @id @default(autoincrement())
  title String
  description String
  source String
  location String
  link String
  timePosted String
  experienceLevel String
  compensation String
  type String
  jobId String
  Job_embedding_store Job_embedding_store[]
  public_Job_embedding_v2_store public_Job_embedding_v2_store[]
  public_Job_embedding_v3_store public_Job_embedding_v3_store[]
  }
- Some of my future plans are:
  Go to previous chats(Already implemented just not in the front end)
  Aggregate from more gig sits
  Try to make it faster by optimizing the postgres vector database

Tools Used

- I used React and Vite
- I used Express and Prisma at the backend
- I used Postgres and Pg vector as my vector database solution
- I used OpenAI's 'text-embedding-small' for embedding
- I used OpenAI's 'gpt-4o-mini' for generation
