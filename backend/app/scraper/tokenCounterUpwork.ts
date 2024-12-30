import fs from "fs";

const largeString = [];

for (let i = 0; i < 10; i++) {
  const file = JSON.parse(
    fs.readFileSync(
      `./datasets/upwork/overallJobDataUpworkv2-${i}.json`,
      "utf8",
    ),
  );
  largeString.push(file);
}

fs.writeFileSync(
  "./datasets/upwork/overallJobDataUpworkv2-condensed.json",
  JSON.stringify(largeString.flat(2)).replaceAll("\\n", " "),
  "utf8",
);
