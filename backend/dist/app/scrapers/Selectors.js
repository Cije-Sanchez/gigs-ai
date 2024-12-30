"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selectors = void 0;
exports.Selectors = {
    indeed: {
        ID: "#mosaic-jobResults li",
        TITLE: ".jobTitle",
        DESCRIPTION: "#jobDescriptionText",
        COMPANY: "[data-testid='company-name']",
        LOCATION: "[data-testid='text-location']",
        LINK: "[contenthtml = 'Apply now']",
        COMPENSATION: "[data-testid*='$']",
        CARDS: "table",
        SHIFT_AND_SCHEDULE: "#mosaic-jobResults li",
        TRAVEL_REQUIREMENTS: "#mosaic-jobResults li",
        BENEFITS: "#mosaic-jobResults li",
        RIGHT_PANE: "a",
        TOTAL_RESULTS: ".jobsearch-JobCountAndSortPane-jobCount",
    },
    freelancer: {
        ARTICLE: ".JobSearchCard-item",
        //Assume you are working with one article
        TITLE: ".JobSearchCard-primary-heading-link",
        TIME_POSTED: ".JobSearchCard-primary-heading-days",
        DESCRIPTION: ".JobSearchCard-primary-description",
        COMPENSATION: ".JobSearchCard-secondary-price",
        LINK: ".JobSearchCard-secondary-price",
    },
    upwork: {
        //Assume you are working with one article
        TITLE: ".job-tile-header",
        EXPERIENCE: "[data-test='experience-level']",
        TIME_POSTED: ".job-tile-header small",
        TYPE: "[data-test='job-type-label']",
        BUDGET: "[data-test='is-fixed-price']",
        DESCRIPTION: "[data-test='UpCLineClamp JobDescription']",
    },
};
//# sourceMappingURL=Selectors.js.map