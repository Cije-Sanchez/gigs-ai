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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const express_1 = require("express");
const promptsv2_1 = require("../utils/promptsv2");
const model_1 = require("../utils/model");
const __1 = require("..");
const chatRouter = (0, express_1.Router)();
chatRouter.post("/createMessage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    var _b, _c;
    console.log(`Received request from ${req.ip}`);
    try {
        let { chatID } = req.body;
        const { messages } = req.body;
        const { sourceFilter, daysofDataFilter } = req.body;
        const systemMessage = {
            role: "system",
            content: promptsv2_1.FIRST_TIME_SYSTEM_PROMPT,
        };
        if (!messages)
            throw new Error("Messages is null");
        const userMessages = messages
            .filter((value) => value.role == "user")
            .map((value) => {
            return value.content;
        });
        let userMessage = "";
        if (userMessages.length == 0)
            throw new Error("Empty user messages?");
        const model = (0, model_1.getModel)("self");
        // const { jobs } = await searchJobs(
        //   userMessages.join("  "),
        //   model,
        //   prisma,
        //   1,
        //   10,
        //   null,
        //   sourceFilter,
        //   daysofDataFilter,
        // );
        //
        //
        const jobs = yield (0, model_1.mockSearchJobs)(prisma);
        const chunks = jobs.map((value) => value.chunk);
        if (userMessages.length > 1) {
            userMessage = (0, promptsv2_1.CREATE_FINE_TUNING_USER_MESSAGE)(userMessages, chunks);
        }
        else {
            userMessage = (0, promptsv2_1.CREATE_FIRST_TIME_USER_MESSAGE)(userMessages[0], chunks);
        }
        const stream = yield model.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemMessage, { role: "user", content: userMessage }],
            stream: true,
        });
        let streamResponse = {
            role: "assistant",
            content: "",
        };
        __1.io.emit("gigsGptResChunk", { chatID: chatID, content: "." });
        try {
            for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), !stream_1_1.done;) {
                const streamUnit = stream_1_1.value;
                try {
                    const chunk = ((_c = (_b = streamUnit.choices[0]) === null || _b === void 0 ? void 0 : _b.delta) === null || _c === void 0 ? void 0 : _c.content) || "";
                    if (chunk) {
                        streamResponse.content += chunk;
                        __1.io.emit("gigsGptResChunk", {
                            chatID: chatID,
                            content: streamResponse.content,
                        });
                    }
                }
                catch (error) {
                    const { message: errorMessage } = error;
                    console.log(errorMessage);
                    __1.io.emit("resError", { chatID: chatID, error: errorMessage });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) yield _a.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const newMessageList = JSON.parse(JSON.stringify(messages));
        newMessageList.push(streamResponse);
        const response = {
            messages: newMessageList,
            error: null,
            chatID: chatID,
            searchResults: jobs,
        };
        console.log(`Finsihed request from ${req.ip}`);
        res.status(200).json(response);
    }
    catch (error) {
        const { message: errorMessage } = error;
        const response = {
            chatID: null,
            error: errorMessage,
            messages: null,
            searchResults: null,
        };
        console.log(errorMessage);
        console.log(`Failed request from ${req.ip}`);
        res.status(505).json(response);
    }
}));
exports.default = chatRouter;
//# sourceMappingURL=chatRouter.js.map