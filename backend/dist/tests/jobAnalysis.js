"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const probableJobs_1 = require("./probableJobs");
console.log(JSON.stringify(probableJobs_1.jobData.metaData.mosaicProviderJobCardsModel.results.map((job) => {
    return {
        title: job.title,
    };
}), null, 2));
//# sourceMappingURL=jobAnalysis.js.map