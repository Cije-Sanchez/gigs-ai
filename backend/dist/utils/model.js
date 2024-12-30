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
exports.generatePromptResponse = exports.getModel = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getModel(openai_key) {
    if (openai_key == "self") {
        return new openai_1.default({
            apiKey: process.env.OPENAI_KEY,
        });
    }
    else {
        return new openai_1.default({
            apiKey: openai_key,
        });
    }
}
exports.getModel = getModel;
function generatePromptResponse(openai, systemMessage, userMessages, model = "gpt-4o-mini", userSystemMixedMessages = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const userMessagesPresented = userMessages.map((userMessage) => {
            return {
                role: "user",
                content: userMessage,
            };
        });
        const systemMessagePresented = {
            role: "system",
            content: systemMessage,
        };
        let messages;
        if (userSystemMixedMessages) {
            const mixedMessages = userSystemMixedMessages.map((mixedMessage) => {
                return {
                    role: mixedMessage.role,
                    content: mixedMessage.content,
                };
            });
            messages = mixedMessages;
        }
        else {
            messages = [systemMessagePresented, ...userMessagesPresented];
        }
        const completion = yield openai.chat.completions.create({
            model,
            messages,
        });
        const generation = completion.choices[0].message.content;
        return {
            generation,
            systemMessage,
            userMessages,
        };
    });
}
exports.generatePromptResponse = generatePromptResponse;
//# sourceMappingURL=model.js.map