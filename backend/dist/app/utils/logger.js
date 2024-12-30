"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const constants_1 = __importDefault(require("./constants"));
function initTransports() {
    const transports = [
        new winston_1.default.transports.Console()
    ];
    if (process.env.NODE_ENV === constants_1.default.Environments.production) {
        transports.push(new winston_1.default.transports.File({
            filename: constants_1.default.Logging.outputs.error,
            level: constants_1.default.Logging.levels.error
        }));
        transports.push(new winston_1.default.transports.File({ filename: constants_1.default.Logging.outputs.error }));
    }
    return transports;
}
const logger = winston_1.default.createLogger({
    level: constants_1.default.Logging.levels.info,
    format: winston_1.default.format.combine(winston_1.default.format.simple(), winston_1.default.format.colorize()),
    transports: initTransports()
});
exports.default = logger;
//# sourceMappingURL=logger.js.map