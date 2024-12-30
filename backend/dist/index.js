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
exports.updateUserTrials = exports.checkUserTrials = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const model_1 = require("./utils/model");
const prompts_1 = require("./utils/prompts");
const validate_html_1 = require("./utils/validate-html");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = require("crypto");
const css_1 = require("./utils/css");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get(`/ping`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.send("We are live");
    }
    catch (error) {
        return res.json({ message: "Error" });
    }
}));
app.post(`/og_response`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, openai_key, prompt: og_prompt } = req.body;
        let model;
        if (!openai_key) {
            const userTrials = checkUserTrials(userId);
            yield updateUserTrials(userId);
            if (!userTrials) {
                const response = {
                    success: false,
                    og_response: null,
                    error: "Trials finished for user",
                };
                return res.status(505).json(response);
            }
            model = (0, model_1.getModel)("self");
        }
        else {
            model = (0, model_1.getModel)(openai_key);
        }
        const allowed_reponses = [
            "create",
            "edit",
            "multiple",
            "delete",
            "rag",
            "undefined",
        ];
        const { generation: og_response_text, userMessages, systemMessage, } = yield (0, model_1.generatePromptResponse)(model, prompts_1.OG_QUERY_PROMPT, [og_prompt]);
        if (!og_response_text) {
            const response = {
                success: false,
                og_response: null,
                error: "Error generating prompt response",
            };
            return res.status(505).json(response);
        }
        const strippedText = og_response_text.toLowerCase().replaceAll(".", "");
        if (allowed_reponses.includes(strippedText)) {
            const reponse = {
                success: true,
                og_response: strippedText,
                error: null,
            };
            return res.status(200).json(reponse);
        }
        else {
            let retries = 0;
            let retriedText = strippedText;
            let retriedMessages = userMessages.map((value) => {
                return { role: "user", content: value };
            });
            retriedMessages.push({ role: "system", content: og_response_text });
            while (retries < prompts_1.MAX_RETRIES && !allowed_reponses.includes(retriedText)) {
                retries = retries + 1;
                const RETRY_PROMPT = `You must return either: create, edit, multiple, delete, rag or undefined as a single word`;
                retriedMessages.push({ role: "user", content: RETRY_PROMPT });
                const { generation: retriedGeneration } = yield (0, model_1.generatePromptResponse)(model, systemMessage, userMessages, "gpt-4-mini", retriedMessages);
                if (!retriedGeneration) {
                    const response = {
                        success: false,
                        og_response: null,
                        error: "Error generating prompt response",
                    };
                    res.status(505).json(response);
                    break;
                }
                retriedMessages.push({ role: "system", content: retriedGeneration });
                retriedText = retriedGeneration.toLowerCase().replaceAll(".", "");
                if (allowed_reponses.includes(retriedText)) {
                    const reponse = {
                        success: true,
                        og_response: strippedText,
                        error: null,
                    };
                    res.status(200).json(reponse);
                    break;
                }
                //TODO: Remove test
                break;
            }
            const response = {
                success: false,
                og_response: null,
                error: "Exceeded maxiumn retries",
            };
            res.status(505).json(response);
        }
    }
    catch (error) {
        const catchError = error;
        const response = {
            success: false,
            og_response: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/fill_bucket`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let bucket;
        const { bucketId, penpotTree } = req.body;
        if (!bucketId || !penpotTree)
            throw new Error("BucketId/ Tree missing");
        bucket = yield prisma.treeBucket.findFirst({
            where: {
                bucketId,
            },
        });
        if (!bucket) {
            throw new Error("Bucket does not exist");
        }
        yield prisma.treeBucket.update({
            where: {
                id: bucket.id,
            },
            data: {
                penpotTree,
            },
        });
        const reponse = {
            success: true,
            bucketId,
            penpotTree,
            error: null,
        };
        res.status(200).json(reponse);
    }
    catch (error) {
        const catchError = error;
        const response = {
            success: false,
            bucketId: null,
            penpotTree: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/poll_bucket`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bucketId } = req.body;
        const bucket = yield prisma.treeBucket.findFirst({
            where: {
                bucketId: bucketId,
            },
        });
        if (!bucket)
            throw new Error("Bucket does not exist");
        const pollResult = bucket.penpotTree ? true : false;
        const response = {
            success: true,
            pollResult: pollResult,
            bucketId: bucketId,
            penpotTree: bucket.penpotTree,
            error: null,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const catchError = error;
        const response = {
            success: false,
            pollResult: false,
            bucketId: null,
            penpotTree: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/fetch_webpage`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bucketId } = req.body;
        const bucket = yield prisma.treeBucket.findFirst({
            where: {
                bucketId: bucketId,
            },
        });
        if (!bucket)
            throw new Error("Failed to create bucket");
        const response = {
            bucketId: bucketId,
            html: bucket.html,
            css: bucket.css,
            error: null,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const catchError = error;
        const response = {
            bucketId: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/create_bucket`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bucketId = (0, crypto_1.randomUUID)();
        const { html, css } = req.body;
        if (!html || !css)
            throw new Error("Missing html or css");
        const bucket = yield prisma.treeBucket.create({
            data: {
                bucketId: bucketId,
                html: html,
                css: css,
            },
        });
        if (!bucket)
            throw new Error("Failed to create bucket");
        const response = {
            success: true,
            bucketId: bucketId,
            error: null,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const catchError = error;
        const response = {
            success: false,
            bucketId: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/create_html`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, openai_key, prompt: tailwindPrompt } = req.body;
        let model;
        if (!openai_key) {
            const userTrials = checkUserTrials(userId);
            yield updateUserTrials(userId);
            if (!userTrials) {
                const response = {
                    success: false,
                    og_response: null,
                    error: "Trials finished for user",
                };
                return res.status(505).json(response);
            }
            model = (0, model_1.getModel)("self");
        }
        else {
            model = (0, model_1.getModel)(openai_key);
        }
        const { generation: tailwindHtml } = yield (0, model_1.generatePromptResponse)(model, prompts_1.CREATE_HTML_SYSTEM_PROMPT, [tailwindPrompt]);
        if (!tailwindHtml) {
            const response = {
                success: false,
                html: null,
                css: null,
                error: "Error generating prompt response",
            };
            return res.status(505).json(response);
        }
        const { html, errors, isValid } = (0, validate_html_1.validateHTML)((0, validate_html_1.cleanHTML)(tailwindHtml));
        if (isValid && !errors && html) {
            const cssResponse = yield (0, css_1.generateCssFromHtml)(html);
            if (cssResponse.error)
                throw Error(cssResponse.error);
            if (!cssResponse.css)
                throw Error("Error generating CSS");
            const response = {
                success: true,
                html: html,
                css: cssResponse.css,
                error: null,
            };
            return res.status(200).json(response);
        }
        else {
            const response = {
                success: false,
                html: null,
                error: "Error creating component",
            };
            return res.status(505).json(response);
        }
    }
    catch (error) {
        const catchError = error;
        const response = {
            success: false,
            html: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.post(`/get_user_trials`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const trials = yield getUserTrials(userId);
        const response = {
            trials: trials,
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const catchError = error;
        const response = {
            trials: null,
            error: catchError.message,
        };
        return res.status(505).json(response);
    }
}));
app.listen(3000, () => console.log(`
🚀 Server ready at: http://localhost:3000
`));
function getUserTrials(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let userDetails;
            userDetails = yield prisma.user.findFirst({
                where: {
                    userId,
                },
            });
            if (!userDetails) {
                userDetails = yield prisma.user.create({
                    data: {
                        userId,
                        trials: 0,
                    },
                });
            }
            return userDetails.trials;
        }
        catch (error) {
            return 0;
        }
    });
}
function checkUserTrials(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let userDetails;
            userDetails = yield prisma.user.findFirst({
                where: {
                    userId,
                },
            });
            if (!userDetails) {
                userDetails = yield prisma.user.create({
                    data: {
                        userId,
                        trials: 0,
                    },
                });
            }
            return userDetails.trials <= prompts_1.MAX_USER_TRIALS;
        }
        catch (error) {
            return false;
        }
    });
}
exports.checkUserTrials = checkUserTrials;
function updateUserTrials(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let userDetails;
            userDetails = yield prisma.user.findFirst({
                where: {
                    userId,
                },
            });
            if (!userDetails) {
                userDetails = yield prisma.user.create({
                    data: {
                        userId,
                        trials: 0,
                    },
                });
            }
            yield prisma.user.update({
                where: {
                    id: userDetails.id,
                },
                data: {
                    trials: userDetails.trials + 1,
                },
            });
            console.info("User Trials: ", userDetails.trials);
        }
        catch (error) {
            throw new Error("Failed to update user free trials");
        }
    });
}
exports.updateUserTrials = updateUserTrials;
//# sourceMappingURL=index.js.map