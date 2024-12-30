import puppeteer from "puppeteer";
import fs from "fs";
import { Selectors } from "./Selectors";
const { upwork } = Selectors;
function getLinks() {
  const baseLink =
    "https://www.upwork.com/nx/search/jobs?per_page=50&q=software&sort=recency&";
  const linkBucket = [];
  for (let i = 1; i < 2; i++) {
    const pageLink = baseLink + `&page=${i}`;
    linkBucket.push(pageLink);
  }
  return linkBucket;
}

async function scrapeUpworkPage(SBR_WS_ENDPOINT: string, link: string) {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    // const browser = await puppeteer.launch({
    //   executablePath: "/usr/bin/chromium-browser",
    //   headless: false,
    // });
    const page = await browser.newPage();
    await page.goto(link);
    await page.waitForNetworkIdle();
    page.on("console", (event) => console.log(event.text()));

    await page.waitForSelector("article");
    const pageData = await page.evaluate(
      (upwork, link) => {
        const { TITLE, EXPERIENCE, TIME_POSTED, TYPE, BUDGET, DESCRIPTION } =
          upwork;

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
        const jobArticles = document.querySelectorAll("article");
        for (const [jobArticleIndex, jobArticle] of Array.from(
          jobArticles,
        ).entries()) {
          try {
            const jobTitleElement = jobArticle.querySelector(TITLE);
            if (!jobTitleElement) throw new Error("Job Title Not found");
            const jobTitleAnchorTag = jobTitleElement.querySelector("a");
            if (!jobTitleAnchorTag)
              throw new Error("Job Anchor Element not found");
            const JOB_LINK =
              (jobTitleAnchorTag as HTMLAnchorElement).getAttribute("href") ||
              "Unspecified";
            const JOB_TITLE = jobTitleAnchorTag.innerText;
            const JOB_COMPANY = "Unspecified";
            const JOB_LOCATION = "Remote";

            const experienceLevelElement = jobArticle.querySelector(EXPERIENCE);
            if (!experienceLevelElement)
              throw new Error("Experience not found");
            const JOB_EXPERIENCE = (experienceLevelElement as HTMLElement)
              .innerText;

            const timePostedElement = jobArticle.querySelector(TIME_POSTED);
            if (!timePostedElement) throw new Error("Time posted not found");
            const JOB_TIME_POSTED = (timePostedElement as HTMLElement)
              .innerText;

            const typeElement = jobArticle.querySelector(TYPE);
            if (!typeElement) throw new Error("Type not found");
            const JOB_TYPE = (typeElement as HTMLElement).innerText;

            let JOB_COMPENSATION;
            if (JOB_TYPE.includes(":")) {
              JOB_COMPENSATION = JOB_TYPE;
            } else if (JOB_TYPE.includes("Hourly")) {
              JOB_COMPENSATION = "Unspecified";
            } else {
              const budgetElement = jobArticle.querySelector(BUDGET);
              if (!budgetElement) throw new Error("Budget not found");
              JOB_COMPENSATION = (budgetElement as HTMLElement).innerText;
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
      upwork,
      link,
    );
    return pageData;
  } catch (error) {
    console.log((error as Error).message);
    return [];
  }
}

async function upworkDailyScrape() {
  const links = getLinks();
  const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
  for (const [index, link] of links.entries()) {
    console.log("Scraping: ", link);
    const upworkPageData = await scrapeUpworkPage(SBR_WS_ENDPOINT, link);
    fs.writeFileSync(
      `datasets/upwork/overallJobDataUpworkv2-${index}.json`,
      JSON.stringify(upworkPageData),
      "utf8",
    );
  }
}

upworkDailyScrape();
