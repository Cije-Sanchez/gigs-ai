# Gigs AI: Streamlining Software Freelancing Job Searches

![Gigs AI: Streamlining Software Freelancing Job Searches](https://your-image-url "Gigs AI Overview")

## :toolbox: Getting Started

1. Make sure **Git**, **NodeJS**, and **PostgreSQL** are installed.
2. Clone this repository to your local computer.
3. Navigate to the backend directory:
4. Setup your .env file: You'll need OPENAI_KEY and TIMESCALE_DB_URL
5. Run:
   ```bash
   npm install
   npm run dev
   ```
6. Navigate to the client directory:
7. Run:
   ```bash
   npm install
   npm run dev
   ```

## Description

Gigs AI is an innovative platform that aggregates software freelance jobs from popular platforms like Freelancer.com and Upwork. Designed for efficiency, it collects and structures job data, enabling freelancers to search, filter, and analyze gigs with ease.

### Key Features

1. **Aggregated Job Data**:

   - Collects job listings from multiple platforms every 24 hours using Bright Data's scraping browser.
   - Includes detailed job information such as title, description, compensation, and experience level.

2. **Chatbot Assistance**:

   - Enables freelancers to interact with a chatbot to refine job searches and get insights.
   - Summarizes job details and filters results based on user queries.

3. **Efficient Data Handling**:

   - Stores structured data in a PostgreSQL database with Pgvector for embedding.
   - Optimized to fetch and process results quickly.

4. **Scalable Hosting**:
   - Hosted on an Amazon EC2 instance for reliability and scalability.

### Schema

Here is the database schema for job storage:

```prisma
model Job {
  id                Int    @id @default(autoincrement())
  title             String
  description       String
  source            String
  location          String
  link              String
  timePosted        String
  experienceLevel   String
  compensation      String
  type              String
  jobId             String
  Job_embedding_store             Job_embedding_store[]
  public_Job_embedding_v2_store   public_Job_embedding_v2_store[]
  public_Job_embedding_v3_store   public_Job_embedding_v3_store[]
}
```

## Architecture

### Data Indexing

![Indexing](/.github/data-indexing.png "Indexing")

### Data Retrieval

![Retrieval](/.github/data-retrieval.png "Retrieval")

## :camera: Screenshots

![Gigs AI](/.github/Screenshot1.png "Gigs AI")  
![Generation](/.github/Screenshot2.png "Generation")  
![Dark Mode](/.github/Screenshot3.png "Dark Mode")

## Future Plans

1. Expand the sources to include more freelancing platforms.
2. Enhance query response speed by optimizing the PostgreSQL vector database.
3. Implement a front-end feature to revisit previous chatbot interactions.

## Tools Used

- **Frontend**: React, Vite
- **Backend**: Express, Prisma
- **Database**: PostgreSQL, Pgvector
- **Embedding**: OpenAI’s `text-embedding-small`
- **Generation**: OpenAI’s `gpt-4o-mini`
- **Hosting**: Amazon EC2
- **Scraping**: Bright Data’s scraping browser

---

Feel free to explore, contribute, or provide feedback to help improve Gigs AI!
