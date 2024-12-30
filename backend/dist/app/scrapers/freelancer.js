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
const { freelancer } = Selectors_1.Selectors;
const { ARTICLE } = freelancer;
function getLinks() {
    const linkBucket = ["https://www.freelancer.com/jobs/software-development"];
    for (let i = 1; i < 18; i++) {
        const pageLink = `https://www.freelancer.com/jobs/${i}/?keyword=Software`;
        linkBucket.push(pageLink);
    }
    return linkBucket;
}
function scrapeFreelancerPage(SBR_WS_ENDPOINT, link) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser = null;
        try {
            // const browser = await puppeteer.connect({
            //   browserWSEndpoint: SBR_WS_ENDPOINT,
            // });
            const browser = yield puppeteer_1.default.launch({
                executablePath: "/usr/bin/chromium-browser",
                headless: false,
            });
            const page = yield browser.newPage();
            yield page.goto(link);
            yield page.waitForNetworkIdle();
            page.on("console", (event) => console.log(event.text()));
            yield page.waitForSelector(ARTICLE);
            const pageData = yield page.evaluate((freelancer, link) => {
                const { TITLE, TIME_POSTED, DESCRIPTION, COMPENSATION, ARTICLE } = freelancer;
                const overallJobData = [];
                const jobArticles = document.querySelectorAll(ARTICLE);
                for (const [jobArticleIndex, jobArticle] of Array.from(jobArticles).entries()) {
                    try {
                        const jobTitleElement = jobArticle.querySelector(TITLE);
                        if (!jobTitleElement)
                            throw new Error("Job Title Not found");
                        const resourceLink = jobTitleElement.getAttribute("href") ||
                            "Unspecified";
                        const JOB_LINK = "https://www.freelancer.com" + resourceLink;
                        const JOB_TITLE = jobTitleElement.innerText;
                        const JOB_COMPANY = "Unspecified";
                        const JOB_LOCATION = "Remote";
                        const JOB_EXPERIENCE = "Unspecified";
                        const timePostedElement = jobArticle.querySelector(TIME_POSTED);
                        if (!timePostedElement)
                            throw new Error("Time posted not found");
                        const JOB_TIME_POSTED = timePostedElement
                            .innerText;
                        const bidElemet = jobArticle.querySelector(COMPENSATION);
                        if (!bidElemet)
                            throw new Error("Compensation not found");
                        const JOB_COMPENSATION = bidElemet.innerText;
                        let JOB_TYPE;
                        if (JOB_COMPENSATION.includes("hr")) {
                            JOB_TYPE = "Hourly";
                        }
                        else {
                            JOB_TYPE = "Fixed";
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
            }, freelancer, link);
            yield browser.close();
            return pageData;
        }
        catch (error) {
            if (browser) {
                yield browser.close();
            }
            console.log(error.message);
            return [];
        }
    });
}
function freelancerSeedScrape() {
    return __awaiter(this, void 0, void 0, function* () {
        const links = getLinks();
        console.log(links.length, " links in the bucket");
        for (const [index, link] of links.entries()) {
            if (index <= 1)
                continue;
            const SBR_WS_ENDPOINT = `wss://brd-customer-hl_8400e525-zone-scraping_browser1:wrxj0ypzd337@brd.superproxy.io:9222`;
            console.log("Scraping: ", link);
            const upworkPageData = yield scrapeFreelancerPage(SBR_WS_ENDPOINT, link);
            fs_1.default.writeFileSync(`datasets/freelancer/overallJobDataFreelancerv2-${index}.json`, JSON.stringify(upworkPageData), "utf8");
        }
    });
}
freelancerSeedScrape();
//# sourceMappingURL=freelancer.js.map