"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const largeString = [];
for (let i = 0; i < 10; i++) {
    const file = JSON.parse(fs_1.default.readFileSync(`./datasets/upwork/overallJobDataUpworkv2-${i}.json`, "utf8"));
    largeString.push(file);
}
fs_1.default.writeFileSync("./datasets/upwork/overallJobDataUpworkv2-condensed.json", JSON.stringify(largeString.flat(2)).replaceAll("\\n", " "), "utf8");
//# sourceMappingURL=tokenCounterUpwork.js.map