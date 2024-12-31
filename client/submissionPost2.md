_This is a submission for the [Bright Data Web Scraping Challenge](https://dev.to/challenges/brightdata): Most Creative Use of Web Data for AI Models_

## What I Built

**Gigs AI** is an innovative tool designed to aggregate software freelance job listings from popular platforms like Freelancer.com and Upwork. By leveraging Bright Data's scraping capabilities, Gigs AI collects, structures, and presents relevant job opportunities in real time, fine-tuning AI-powered recommendations for freelancers looking to streamline their job search.

## Architecture

### Data Indexing

### Data Retrieval

## Demo

- **Live Project**: [Gigs AI Demo Link](https://gigs-ai.vercel.app/)
- **Source Code**: [GitHub Repository](https://github.com/Cije-Sanchez/gigs-ai)
  Here are a few screenshots of the application in action:

## How I Used Bright Data

Bright Data’s **Web Scraper API** and **Scraping Browser** are central to Gigs AI’s ability to fetch up-to-date software freelance job postings. The scraping process runs every 24 hours, collecting data points such as job titles, descriptions, sources, experience levels, and compensation.

The collected data is stored in a **Postgres vector database** with embeddings generated using OpenAI’s `text-embedding-small`. This allows freelancers to search and filter job postings efficiently based on relevance and preferences.

### Additional Features:

- **Job Insights Generation**: The application uses OpenAI’s `gpt-4o-mini` to generate insights about the job based on the posting details.
- **Structured Schema**:

```prisma
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
```

## Tools Used

- **Frontend**: React + Vite
- **Backend**: Express + Prisma
- **Database**: Postgres with PgVector for efficient vector search
- **Bright Data**: Web Scraper API & Scraping Browser for automated job data collection
- **AI Models**:
  - OpenAI’s `text-embedding-small` for embedding
  - OpenAI’s `gpt-4o-mini` for text generation
- **Hosting**: Amazon EC2 Instance

## Key Features

1. **Daily Job Updates**: Fetches the latest software freelance jobs from multiple platforms.
2. **Advanced Search**: Vectorized search allows freelancers to find relevant jobs quickly.
3. **Job Insights**: AI-powered summaries help users assess job suitability.
4. **Seamless Experience**: Fast job aggregation and intuitive interface built with React and Vite.

## Future Plans

- **Multi-platform Aggregation**: Expand job collection to more freelancing sites.
- **Improved Performance**: Optimize Postgres vector queries for faster search results.
- **Enhanced User Interface**: Add support for saved searches and previous job views.
- **Dynamic Recommendations**: Refine AI suggestions based on user interaction and preferences.

**Final Thoughts**

Building Gigs AI was an exciting journey into the intersection of web scraping, AI, and freelancing. Bright Data’s tools made it effortless to collect structured web data, while Postgres and OpenAI models provided the backbone for intelligent job matching.

With future improvements, Gigs AI aims to become the ultimate assistant for freelancers seeking software gigs.

**Thank you for reviewing my submission!**
