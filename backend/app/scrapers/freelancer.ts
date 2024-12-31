import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import { Selectors } from "./Selectors";
const { freelancer } = Selectors;
const { ARTICLE } = freelancer;
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

function getLinks() {
  const linkBucket = ["https://www.freelancer.com/jobs/software-development"];
  for (let i = 1; i < 2; i++) {
    const pageLink = `https://www.freelancer.com/jobs/${i}/?keyword=Software`;
    linkBucket.push(pageLink);
  }
  return linkBucket;
}

async function scrapeFreelancerPage(SBR_WS_ENDPOINT: string, link: string) {
  let browser: Browser | null = null;
  try {
    // const browser = await puppeteer.connect({
    //   browserWSEndpoint: SBR_WS_ENDPOINT,
    // });
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForNetworkIdle();
    page.on("console", (event) => console.log(event.text()));

    await page.waitForSelector(ARTICLE);
    const pageData = await page.evaluate(
      (freelancer, link) => {
        const { TITLE, TIME_POSTED, DESCRIPTION, COMPENSATION, ARTICLE } =
          freelancer;

        const overallJobData: {
          experience: string;
          timePosted: string;
          type: string;
          compensation: string;
          description: string;
          link: string;
          id: string;
          title: string;
          company: string;
          location: string;
        }[] = [];
        const jobArticles = document.querySelectorAll(ARTICLE);
        for (const [jobArticleIndex, jobArticle] of Array.from(
          jobArticles,
        ).entries()) {
          try {
            const jobTitleElement = jobArticle.querySelector(TITLE);
            if (!jobTitleElement) throw new Error("Job Title Not found");
            const resourceLink =
              (jobTitleElement as HTMLAnchorElement).getAttribute("href") ||
              "Unspecified";
            const JOB_LINK = "https://www.freelancer.com" + resourceLink;
            const JOB_TITLE = (jobTitleElement as HTMLElement).innerText;
            const JOB_COMPANY = "Unspecified";
            const JOB_LOCATION = "Remote";
            const JOB_EXPERIENCE = "Unspecified";
            const timePostedElement = jobArticle.querySelector(TIME_POSTED);
            if (!timePostedElement) throw new Error("Time posted not found");
            const JOB_TIME_POSTED = (timePostedElement as HTMLElement)
              .innerText;

            const bidElemet = jobArticle.querySelector(COMPENSATION);
            if (!bidElemet) throw new Error("Compensation not found");
            const JOB_COMPENSATION = (bidElemet as HTMLElement).innerText;

            let JOB_TYPE;
            if (JOB_COMPENSATION.includes("hr")) {
              JOB_TYPE = "Hourly";
            } else {
              JOB_TYPE = "Fixed";
            }
            const descriptionElement = jobArticle.querySelector(DESCRIPTION);
            if (!descriptionElement) throw new Error("Type not found");
            const JOB_DESCRIPTION = (descriptionElement as HTMLElement)
              .innerText;

            const currentJob = {
              id: JOB_LINK,
              experience: JOB_EXPERIENCE,
              timePosted: JOB_TIME_POSTED,
              type: JOB_TYPE,
              compensation: JOB_COMPENSATION,
              description: JOB_DESCRIPTION,
              link: JOB_LINK,
              title: JOB_TITLE,
              company: JOB_COMPANY,
              location: JOB_LOCATION,
            };
            console.log(currentJob);
            overallJobData.push(currentJob);
          } catch (error) {
            console.log((error as Error).message);
            continue;
          }
        }
        return overallJobData;
      },
      freelancer,
      link,
    );
    await browser.close();
    return pageData;
  } catch (error) {
    if (browser) {
      await (browser as Browser).close();
    }
    console.log((error as Error).message);
    return [];
  }
}

async function freelancerSeedScrape() {
  const links = getLinks();
  console.log(links.length, " links in the bucket");
  for (const [index, link] of links.entries()) {
    if (index <= 1) continue;
    const SBR_WS_ENDPOINT = process.env.SBR_WS_ENDPOINT;
    console.log("Scraping: ", link);
    const upworkPageData = await scrapeFreelancerPage(SBR_WS_ENDPOINT, link);
    fs.writeFileSync(
      `datasets/freelancer/overallJobDataFreelancerv2-${index}.json`,
      JSON.stringify(upworkPageData),
      "utf8",
    );
  }
}

freelancerSeedScrape();

cron.schedule("*/4 * * * *", async () => {
  const currentTime = new Date().toISOString();
  console.log(`Cron job triggered at: ${currentTime}`);

  try {
    await freelancerSeedScrape();
    console.log(`Scraped Indeed`);
  } catch (error) {
    console.error(`Error occurred`);
  }
});

console.log("Cron job initialized. It will run every 4 minutes.");
