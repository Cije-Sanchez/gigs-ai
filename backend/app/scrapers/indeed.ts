// import puppeteer from "puppeteer";
import * as puppeteer from "puppeteer";
import { Selectors } from "./Selectors";
const { indeed } = Selectors;
import fs from "fs";
import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

async function getLinks(days: 1 | 14 = 1) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/chromium-browser",
  });

  const targetExperiences = ["MID_LEVEL", "ENTRY_LEVEL", "SENIOR_LEVEL"];
  const links = targetExperiences.map((experienceLevel) => {
    return {
      link: `https://www.indeed.com/jobs?q=job&l=&fromage=${days}&sc=0kf:attr(DSQF7)explvl(${experienceLevel});&from=searchOnDesktopSerp`,
      experienceLevel: experienceLevel,
    };
  });
  // const noExperienceLink = `https://www.indeed.com/jobs?q=job&l=&fromage=14&sc=0kf%3Aattr(D7S5D)attr(DSQF7)%3B&from=searchOnDesktopSerp`;
  // links.push(noExperienceLink);

  const allLinks: { link: string; experience: string }[] = [];
  for (const [index, linkObject] of links.entries()) {
    const { link, experienceLevel } = linkObject;
    const page = await browser.newPage();
    page.on("console", (event) => {
      console.log(event.text());
    });
    await page.goto(link);
    await page.waitForSelector(indeed.CARDS);

    const totalResults = await page.evaluate((indeed) => {
      const { TOTAL_RESULTS } = indeed;
      try {
        const totalPages = document.querySelector(TOTAL_RESULTS);
        if (!totalPages) throw new Error("Pages missing");
        const totalResultsRegex = /[\d,]*/;
        const totalResultsString = (totalPages as HTMLElement).innerText.match(
          totalResultsRegex,
        );
        if (!totalResultsString || totalResultsString.length == 0)
          throw new Error("Parsing error for total results");
        console.log("Total Results String: ", totalResultsString[0]);
        console.log(
          "Total Results Number: ",
          Number(totalResultsString[0].replaceAll(",", "")),
        );
        return Number(totalResultsString[0].replaceAll(",", ""));
      } catch (error) {
        console.log((error as Error).message);
        return 0;
      }
    }, indeed);

    const resultsPerPage = 15;
    const numberOfPages = Math.ceil(totalResults / resultsPerPage);
    console.log("Number of pages for ", link, " is ", numberOfPages);

    allLinks.push({
      link,
      experience: experienceLevel,
    });
    console.log(allLinks);
    let resultsSeen = 0;
    let start = 10;
    while (resultsSeen < totalResults) {
      const currentLink = link + `&start=${start}`;
      allLinks.push({
        link: currentLink,
        experience: experienceLevel,
      });
      start = start + 10;
      resultsSeen = resultsSeen + resultsPerPage;
    }
    await page.close();
  }
  await browser.close();
  return allLinks;
}

// getLinks();

async function scrapeIndeedPageForLinks(
  SBR_WS_ENDPOINT: string,
  link: string,
  experience: string,
  timePosted: string,
) {
  try {
    let browser: puppeteer.Browser;
    browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    const page = await browser.newPage();

    page.on("console", (event) => {
      console.log(event.text());
    });
    await page.goto(link);
    await page.waitForSelector(indeed.CARDS);

    const data = await page.evaluate((indeed) => {
      const { CARDS, TITLE, COMPANY, LOCATION } = indeed;
      const jobs: { title: string; company: string; location: string }[] = [];
      try {
        const jobCards = Array.from(document.querySelectorAll(CARDS));
        for (const [index, jobCard] of jobCards.entries()) {
          const jobTitle = jobCard.querySelector(TITLE);
          const jobCompany = jobCard.querySelector(COMPANY);
          const jobLocation = jobCard.querySelector(LOCATION);
          if (!jobTitle) throw new Error("No Job Title");
          if (!jobCompany) throw new Error("No Job Company");
          if (!jobLocation) throw new Error("No Job Location");
          jobs.push({
            title: (jobTitle as HTMLElement).innerText,
            company: (jobCompany as HTMLElement).innerText,
            location: (jobLocation as HTMLElement).innerText,
          });
        }
        return jobs;
      } catch (error) {
        const catchErrorInner = error as Error;
        console.log(catchErrorInner.message);
        return [];
      }
    }, indeed);

    const jobLinks: {
      link: string;
      title: string;
      company: string;
      location: string;
    }[] = [];
    for (const [index, job] of data.entries()) {
      await page.evaluate(
        (index, indeed) => {
          const { CARDS } = indeed;
          try {
            const jobCards = document.querySelectorAll(CARDS);
            if (jobCards.length < index - 1)
              throw new Error("Job listing has possibly changed");
            const targetCard = jobCards[index] as HTMLElement;
            if (!targetCard)
              throw new Error("Job listing has possibly changed");
            targetCard.click();
          } catch (error) {
            const catchErrorInner = error as Error;
            console.log(catchErrorInner.message);
          }
        },
        index,
        indeed,
      );
      const vjkId = await page.evaluate(
        (index, indeed) => {
          const { CARDS } = indeed;
          try {
            const jobCards = document.querySelectorAll(CARDS);
            if (jobCards.length < index - 1)
              throw new Error("Job listing has possibly changed");
            const targetCard = jobCards[index] as HTMLElement;
            if (!targetCard)
              throw new Error("Job listing has possibly changed");

            const targetCardLink = targetCard.querySelector("[href]");
            if (!targetCardLink)
              throw new Error("Job listing has possibly changed");

            const targetCardSpanElement = targetCardLink.querySelector("span");
            if (!targetCardSpanElement)
              throw new Error("Job listing has possibly changed");

            const linkWithNoise = targetCardSpanElement.getAttribute("id");
            if (!linkWithNoise) throw new Error("Error occured parsing link");

            return linkWithNoise.split("-")[1];
          } catch (error) {
            const catchErrorInner = error as Error;
            console.log(catchErrorInner.message);
            return "";
          }
        },
        index,
        indeed,
      );
      const isolatedJobLink = "https://www.indeed.com/viewjob?";
      const targetCardHref = isolatedJobLink + `jk=${vjkId}`;
      const targetJobDetails = {
        ...job,
        link: targetCardHref,
      };
      jobLinks.push(targetJobDetails);
    }
    await browser.close();
    return jobLinks;
  } catch (error) {
    const catchError = error as Error;
    console.log("Error: ", catchError);
    return [];
  }
}

async function indeedScrapeJobPage(
  jobLink: string,
  SBR_WS_ENDPOINT: string,
  experience: string,
  date: string,
) {
  let browser: puppeteer.Browser;
  browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT,
  });
  const detailsPage = await browser.newPage();
  await detailsPage.goto(jobLink);
  await detailsPage.waitForNetworkIdle();
  await detailsPage.waitForSelector(indeed.DESCRIPTION);
  detailsPage.on("console", (event) => {
    if (event.text().includes("dsp"))
      console.log("Details Page: ", event.text());
  });

  const furtherJobDetails = await detailsPage.evaluate((indeed) => {
    const { DESCRIPTION, COMPENSATION } = indeed;
    try {
      const rightPane = document.querySelector("body");
      if (!rightPane) throw new Error("Right pane does not exist yet - dsp");

      let compensationText;
      const compensation = rightPane.querySelector(COMPENSATION);
      if (compensation) {
        compensationText = (compensation as HTMLElement).innerText;
      } else {
        compensationText = "";
      }

      let descriptionText;
      const description = rightPane.querySelector(DESCRIPTION);
      if (description) {
        descriptionText = (description as HTMLElement).innerText;
      } else {
        descriptionText = "";
      }

      let typeText: string;
      try {
        const heading = Array.from(document.querySelectorAll("h3")).find(
          (h3) => {
            if (!h3.textContent) return false;
            return h3.textContent.trim() === "Job type";
          },
        );
        if (!heading) throw new Error("No heading of that description found");
        const headingParent = heading.parentElement;
        if (!headingParent) throw new Error("");
        typeText = Array.from(headingParent.querySelectorAll("li"))
          .map((element) => {
            return element.innerText;
          })
          .join(" -- ");
      } catch (error) {
        console.log((error as Error).message);
        typeText = "";
      }
      return {
        type: typeText,
        compensation: compensationText,
        description: descriptionText,
      };
    } catch (error) {
      const catchErrorInner = error as Error;
      console.log(catchErrorInner.message + " -dsp");
      return null;
    }
  }, indeed);

  if (!furtherJobDetails) return -1;
  const evenMoreJobDetails = {
    ...furtherJobDetails,
    experience,
    timePosted: date,
    id: jobLink,
    link: jobLink,
  };
  await browser.close();
  return evenMoreJobDetails;
}

async function indeedDailyScrape() {
  const dailyJobLinks = await getLinks();
  const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
  for (const [index, link] of dailyJobLinks.entries()) {
    await scrapeIndeedPageForLinks(
      SBR_WS_ENDPOINT,
      link.link,
      link.experience,
      new Date(Date.now())
        .toLocaleString()
        .replaceAll(" ", "")
        .split(",")[0]
        .replaceAll("/", "--"),
    );
  }
}

async function indeedSeedScrape() {
  const links = [];
  const experienceLevels = ["MID_LEVEL", "ENTRY_LEVEL", "SENIOR_LEVEL"];
  const PAGES_PER_EXPERIENCE = 30;
  const SBR_WS_ENDPOINT = process.env.SBR_WS_ENDPOINT;
  for (const [index, experience] of experienceLevels.entries()) {
    const baseLink = `https://www.indeed.com/jobs?q=software&l=&fromage=14&sc=0kf:attr(DSQF7)explvl(${experience});&from=searchOnDesktopSerp`;
    for (let i = 3; i < PAGES_PER_EXPERIENCE; i++) {
      links.push({ link: baseLink + `&start=${i}0`, experience: experience });
    }
  }
  for (const [index, link] of links.entries()) {
    console.log("Scraping ", link, " for links");
    const individualJobLinks = await scrapeIndeedPageForLinks(
      SBR_WS_ENDPOINT,
      link.link,
      link.experience,
      new Date(Date.now())
        .toLocaleString()
        .replaceAll(" ", "")
        .split(",")[0]
        .replaceAll("/", "--"),
    );
    console.log("Found ", individualJobLinks.length, " links for ", link);

    for (const [jobIndex, jobLink] of individualJobLinks.entries()) {
      console.log("Scraping job: ", jobLink.link);
      const jobDetails = await indeedScrapeJobPage(
        jobLink.link,
        SBR_WS_ENDPOINT,
        link.experience,
        new Date(Date.now())
          .toLocaleString()
          .replaceAll(" ", "")
          .split(",")[0]
          .replaceAll("/", "--"),
      );
      if (jobDetails == -1) {
        console.log("Added to issue bucket");
        const issues = JSON.parse(
          fs.readFileSync("./issueBucket.json", "utf8"),
        ) as {
          jobLink: {
            link: string;
            title: string;
            company: string;
            location: string;
          };
          experience: string;
          date: string;
        }[];
        const date = new Date(Date.now())
          .toLocaleString()
          .replaceAll(" ", "")
          .split(",")[0]
          .replaceAll("/", "--");
        const issue = {
          jobLink,
          experience: link.experience,
          date: date,
        };
        issues.push(issue);
        fs.writeFileSync("./issueBucket.json", JSON.stringify(issue), "utf8");
        continue;
      }
      fs.writeFileSync(
        `datasets/indeed/indeedJob-${index}-${jobIndex}.json`,
        JSON.stringify(jobDetails),
        "utf8",
      );
      console.log("Written job: ", jobLink.link);
    }
  }
}

indeedSeedScrape();

cron.schedule("*/4 * * * *", async () => {
  const currentTime = new Date().toISOString();
  console.log(`Cron job triggered at: ${currentTime}`);

  try {
    await indeedDailyScrape();
    console.log(`Scraped Indeed`);
  } catch (error) {
    console.error(`Error occurred`);
  }
});

console.log("Cron job initialized. It will run every 4 minutes.");
