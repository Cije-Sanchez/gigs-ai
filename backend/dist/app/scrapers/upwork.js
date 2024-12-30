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
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const Selectors_1 = require("./Selectors");
const { upwork } = Selectors_1.Selectors;
function getLinks() {
    const baseLink = "https://www.upwork.com/nx/search/jobs?per_page=50&q=software&sort=recency&";
    const linkBucket = [];
    for (let i = 1; i < 2; i++) {
        const pageLink = baseLink + `&page=${i}`;
        linkBucket.push(pageLink);
    }
    return linkBucket;
}
function scrapeUpworkPage(SBR_WS_ENDPOINT, link) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.connect({
                browserWSEndpoint: SBR_WS_ENDPOINT,
            });
            // const browser = await puppeteer.launch({
            //   executablePath: "/usr/bin/chromium-browser",
            //   headless: false,
            // });
            const page = yield browser.newPage();
            yield page.goto(link);
            yield page.waitForNetworkIdle();
            page.on("console", (event) => console.log(event.text()));
            yield page.waitForSelector("article");
            const pageData = yield page.evaluate((upwork, link) => {
                const { TITLE, EXPERIENCE, TIME_POSTED, TYPE, BUDGET, DESCRIPTION } = upwork;
                const overallJobData = [];
                const jobArticles = document.querySelectorAll("article");
                for (const [jobArticleIndex, jobArticle] of Array.from(jobArticles).entries()) {
                    try {
                        const jobTitleElement = jobArticle.querySelector(TITLE);
                        if (!jobTitleElement)
                            throw new Error("Job Title Not found");
                        const jobTitleAnchorTag = jobTitleElement.querySelector("a");
                        if (!jobTitleAnchorTag)
                            throw new Error("Job Anchor Element not found");
                        const JOB_LINK = jobTitleAnchorTag.getAttribute("href") ||
                            "Unspecified";
                        const JOB_TITLE = jobTitleAnchorTag.innerText;
                        const JOB_COMPANY = "Unspecified";
                        const JOB_LOCATION = "Remote";
                        const experienceLevelElement = jobArticle.querySelector(EXPERIENCE);
                        if (!experienceLevelElement)
                            throw new Error("Experience not found");
                        const JOB_EXPERIENCE = experienceLevelElement
                            .innerText;
                        const timePostedElement = jobArticle.querySelector(TIME_POSTED);
                        if (!timePostedElement)
                            throw new Error("Time posted not found");
                        const JOB_TIME_POSTED = timePostedElement
                            .innerText;
                        const typeElement = jobArticle.querySelector(TYPE);
                        if (!typeElement)
                            throw new Error("Type not found");
                        const JOB_TYPE = typeElement.innerText;
                        let JOB_COMPENSATION;
                        if (JOB_TYPE.includes(":")) {
                            JOB_COMPENSATION = JOB_TYPE;
                        }
                        else if (JOB_TYPE.includes("Hourly")) {
                            JOB_COMPENSATION = "Unspecified";
                        }
                        else {
                            const budgetElement = jobArticle.querySelector(BUDGET);
                            if (!budgetElement)
                                throw new Error("Budget not found");
                            JOB_COMPENSATION = budgetElement.innerText;
                        }
                        const descriptionElement = jobArticle.querySelector(DESCRIPTION);
                        if (!descriptionElement)
                            throw new Error("Type not found");
                        const JOB_DESCRIPTION = descriptionElement
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
                    }
                    catch (error) {
                        console.log(error.message);
                        continue;
                    }
                }
                return overallJobData;
            }, upwork, link);
            return pageData;
        }
        catch (error) {
            console.log(error.message);
            return [];
        }
    });
}
function upworkDailyScrape() {
    return __awaiter(this, void 0, void 0, function* () {
        const links = getLinks();
        const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
        for (const [index, link] of links.entries()) {
            console.log("Scraping: ", link);
            const upworkPageData = yield scrapeUpworkPage(SBR_WS_ENDPOINT, link);
            fs_1.default.writeFileSync(`datasets/upwork/overallJobDataUpworkv2-${index}.json`, JSON.stringify(upworkPageData), "utf8");
        }
    });
}
upworkDailyScrape();
//# sourceMappingURL=upwork.js.map