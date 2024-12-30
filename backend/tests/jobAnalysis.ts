import { jobData } from "./probableJobs";

console.log(
  JSON.stringify(
    jobData.metaData.mosaicProviderJobCardsModel.results.map((job) => {
      return {
        title: job.title,
      };
    }),
    null,
    2,
  ),
);
