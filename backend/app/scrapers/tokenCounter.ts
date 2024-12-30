import fs from "fs";

const largeString = [];

for (let i = 0; i < 18; i++) {
  const file = JSON.parse(
    fs.readFileSync(
      `./datasets/freelancer/overallJobDataFreelancerv2-${i}.json`,
      "utf8",
    ),
  );
  largeString.push(file);
}

fs.writeFileSync(
  "./datasets/freelancer/overallJobDataFreelancerv2-condensed.json",
  JSON.stringify(largeString.flat(2)).replaceAll("\\n", " "),
  "utf8",
);
