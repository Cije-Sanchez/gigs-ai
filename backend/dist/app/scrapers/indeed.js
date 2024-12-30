"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// import puppeteer from "puppeteer";
const puppeteer = __importStar(require("puppeteer"));
const Selectors_1 = require("./Selectors");
const { indeed } = Selectors_1.Selectors;
const fs_1 = __importDefault(require("fs"));
function getLinks(days = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({
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
        const allLinks = [];
        for (const [index, linkObject] of links.entries()) {
            const { link, experienceLevel } = linkObject;
            const page = yield browser.newPage();
            page.on("console", (event) => {
                console.log(event.text());
            });
            yield page.goto(link);
            yield page.waitForSelector(indeed.CARDS);
            const totalResults = yield page.evaluate((indeed) => {
                const { TOTAL_RESULTS } = indeed;
                try {
                    const totalPages = document.querySelector(TOTAL_RESULTS);
                    if (!totalPages)
                        throw new Error("Pages missing");
                    const totalResultsRegex = /[\d,]*/;
                    const totalResultsString = totalPages.innerText.match(totalResultsRegex);
                    if (!totalResultsString || totalResultsString.length == 0)
                        throw new Error("Parsing error for total results");
                    console.log("Total Results String: ", totalResultsString[0]);
                    console.log("Total Results Number: ", Number(totalResultsString[0].replaceAll(",", "")));
                    return Number(totalResultsString[0].replaceAll(",", ""));
                }
                catch (error) {
                    console.log(error.message);
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
            yield page.close();
        }
        yield browser.close();
        return allLinks;
    });
}
// getLinks();
function scrapeIndeedPageForLinks(SBR_WS_ENDPOINT, link, experience, timePosted) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let browser;
            browser = yield puppeteer.connect({
                browserWSEndpoint: SBR_WS_ENDPOINT,
            });
            const page = yield browser.newPage();
            page.on("console", (event) => {
                console.log(event.text());
            });
            yield page.goto(link);
            yield page.waitForSelector(indeed.CARDS);
            const data = yield page.evaluate((indeed) => {
                const { CARDS, TITLE, COMPANY, LOCATION } = indeed;
                const jobs = [];
                try {
                    const jobCards = Array.from(document.querySelectorAll(CARDS));
                    for (const [index, jobCard] of jobCards.entries()) {
                        const jobTitle = jobCard.querySelector(TITLE);
                        const jobCompany = jobCard.querySelector(COMPANY);
                        const jobLocation = jobCard.querySelector(LOCATION);
                        if (!jobTitle)
                            throw new Error("No Job Title");
                        if (!jobCompany)
                            throw new Error("No Job Company");
                        if (!jobLocation)
                            throw new Error("No Job Location");
                        jobs.push({
                            title: jobTitle.innerText,
                            company: jobCompany.innerText,
                            location: jobLocation.innerText,
                        });
                    }
                    return jobs;
                }
                catch (error) {
                    const catchErrorInner = error;
                    console.log(catchErrorInner.message);
                    return [];
                }
            }, indeed);
            const jobLinks = [];
            for (const [index, job] of data.entries()) {
                yield page.evaluate((index, indeed) => {
                    const { CARDS } = indeed;
                    try {
                        const jobCards = document.querySelectorAll(CARDS);
                        if (jobCards.length < index - 1)
                            throw new Error("Job listing has possibly changed");
                        const targetCard = jobCards[index];
                        if (!targetCard)
                            throw new Error("Job listing has possibly changed");
                        targetCard.click();
                    }
                    catch (error) {
                        const catchErrorInner = error;
                        console.log(catchErrorInner.message);
                    }
                }, index, indeed);
                const vjkId = yield page.evaluate((index, indeed) => {
                    const { CARDS } = indeed;
                    try {
                        const jobCards = document.querySelectorAll(CARDS);
                        if (jobCards.length < index - 1)
                            throw new Error("Job listing has possibly changed");
                        const targetCard = jobCards[index];
                        if (!targetCard)
                            throw new Error("Job listing has possibly changed");
                        const targetCardLink = targetCard.querySelector("[href]");
                        if (!targetCardLink)
                            throw new Error("Job listing has possibly changed");
                        const targetCardSpanElement = targetCardLink.querySelector("span");
                        if (!targetCardSpanElement)
                            throw new Error("Job listing has possibly changed");
                        const linkWithNoise = targetCardSpanElement.getAttribute("id");
                        if (!linkWithNoise)
                            throw new Error("Error occured parsing link");
                        return linkWithNoise.split("-")[1];
                    }
                    catch (error) {
                        const catchErrorInner = error;
                        console.log(catchErrorInner.message);
                        return "";
                    }
                }, index, indeed);
                const isolatedJobLink = "https://www.indeed.com/viewjob?";
                const targetCardHref = isolatedJobLink + `jk=${vjkId}`;
                const targetJobDetails = Object.assign(Object.assign({}, job), { link: targetCardHref });
                jobLinks.push(targetJobDetails);
            }
            yield browser.close();
            return jobLinks;
        }
        catch (error) {
            const catchError = error;
            console.log("Error: ", catchError);
            return [];
        }
    });
}
function indeedScrapeJobPage(jobLink, SBR_WS_ENDPOINT, experience, date) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser;
        browser = yield puppeteer.connect({
            browserWSEndpoint: SBR_WS_ENDPOINT,
        });
        const detailsPage = yield browser.newPage();
        yield detailsPage.goto(jobLink);
        yield detailsPage.waitForNetworkIdle();
        yield detailsPage.waitForSelector(indeed.DESCRIPTION);
        detailsPage.on("console", (event) => {
            if (event.text().includes("dsp"))
                console.log("Details Page: ", event.text());
        });
        const furtherJobDetails = yield detailsPage.evaluate((indeed) => {
            const { DESCRIPTION, COMPENSATION } = indeed;
            try {
                const rightPane = document.querySelector("body");
                if (!rightPane)
                    throw new Error("Right pane does not exist yet - dsp");
                let compensationText;
                const compensation = rightPane.querySelector(COMPENSATION);
                if (compensation) {
                    compensationText = compensation.innerText;
                }
                else {
                    compensationText = "";
                }
                let descriptionText;
                const description = rightPane.querySelector(DESCRIPTION);
                if (description) {
                    descriptionText = description.innerText;
                }
                else {
                    descriptionText = "";
                }
                let typeText;
                try {
                    const heading = Array.from(document.querySelectorAll("h3")).find((h3) => {
                        if (!h3.textContent)
                            return false;
                        return h3.textContent.trim() === "Job type";
                    });
                    if (!heading)
                        throw new Error("No heading of that description found");
                    const headingParent = heading.parentElement;
                    if (!headingParent)
                        throw new Error("");
                    typeText = Array.from(headingParent.querySelectorAll("li"))
                        .map((element) => {
                        return element.innerText;
                    })
                        .join(" -- ");
                }
                catch (error) {
                    console.log(error.message);
                    typeText = "";
                }
                return {
                    type: typeText,
                    compensation: compensationText,
                    description: descriptionText,
                };
            }
            catch (error) {
                const catchErrorInner = error;
                console.log(catchErrorInner.message + " -dsp");
                return null;
            }
        }, indeed);
        if (!furtherJobDetails)
            return -1;
        const evenMoreJobDetails = Object.assign(Object.assign({}, furtherJobDetails), { experience, timePosted: date, id: jobLink, link: jobLink });
        yield browser.close();
        return evenMoreJobDetails;
    });
}
function indeedDailyScrape() {
    return __awaiter(this, void 0, void 0, function* () {
        const dailyJobLinks = yield getLinks();
        const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
        for (const [index, link] of dailyJobLinks.entries()) {
            yield scrapeIndeedPageForLinks(SBR_WS_ENDPOINT, link.link, link.experience, new Date(Date.now())
                .toLocaleString()
                .replaceAll(" ", "")
                .split(",")[0]
                .replaceAll("/", "--"));
        }
    });
}
function indeedSeedScrape() {
    return __awaiter(this, void 0, void 0, function* () {
        const links = [];
        const experienceLevels = ["MID_LEVEL", "ENTRY_LEVEL", "SENIOR_LEVEL"];
        const PAGES_PER_EXPERIENCE = 30;
        const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
        for (const [index, experience] of experienceLevels.entries()) {
            const baseLink = `https://www.indeed.com/jobs?q=software&l=&fromage=14&sc=0kf:attr(DSQF7)explvl(${experience});&from=searchOnDesktopSerp`;
            for (let i = 3; i < PAGES_PER_EXPERIENCE; i++) {
                links.push({ link: baseLink + `&start=${i}0`, experience: experience });
            }
        }
        for (const [index, link] of links.entries()) {
            console.log("Scraping ", link, " for links");
            const individualJobLinks = yield scrapeIndeedPageForLinks(SBR_WS_ENDPOINT, link.link, link.experience, new Date(Date.now())
                .toLocaleString()
                .replaceAll(" ", "")
                .split(",")[0]
                .replaceAll("/", "--"));
            console.log("Found ", individualJobLinks.length, " links for ", link);
            for (const [jobIndex, jobLink] of individualJobLinks.entries()) {
                console.log("Scraping job: ", jobLink.link);
                const jobDetails = yield indeedScrapeJobPage(jobLink.link, SBR_WS_ENDPOINT, link.experience, new Date(Date.now())
                    .toLocaleString()
                    .replaceAll(" ", "")
                    .split(",")[0]
                    .replaceAll("/", "--"));
                if (jobDetails == -1) {
                    console.log("Added to issue bucket");
                    const issues = JSON.parse(fs_1.default.readFileSync("./issueBucket.json", "utf8"));
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
                    fs_1.default.writeFileSync("./issueBucket.json", JSON.stringify(issue), "utf8");
                    continue;
                }
                fs_1.default.writeFileSync(`datasets/indeed/indeedJob-${index}-${jobIndex}.json`, JSON.stringify(jobDetails), "utf8");
                console.log("Written job: ", jobLink.link);
            }
        }
    });
}
indeedSeedScrape();
//# sourceMappingURL=indeed.js.map