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
exports.generateCssFromHtml = void 0;
const postcss_1 = __importDefault(require("postcss"));
const tailwindcss_1 = __importDefault(require("tailwindcss"));
const fs_1 = __importDefault(require("fs"));
function generateCssFromHtml(htmlContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            content: [{ raw: htmlContent, extension: "html" }],
            theme: {
                extend: {},
            },
            plugins: [],
        };
        const processor = (0, postcss_1.default)([(0, tailwindcss_1.default)(config)]);
        try {
            const result = yield processor.process("@tailwind base; @tailwind components; @tailwind utilities;", {
                from: undefined,
            });
            const css = result.css;
            return {
                css,
                error: null,
            };
        }
        catch (error) {
            const catchError = error;
            return {
                css: null,
                error: catchError.message,
            };
        }
    });
}
exports.generateCssFromHtml = generateCssFromHtml;
function testGenerate() {
    return __awaiter(this, void 0, void 0, function* () {
        const testHtml = `
<div class="flex items-center justify-center p-8 w-[500px] h-[500px] bg-red-500">
  <div class="bg-black text-white p-8 rounded">
    This is a centered particle.
  </div>
</div>

`;
        const { css } = yield generateCssFromHtml(testHtml);
        if (!css)
            return;
        fs_1.default.writeFileSync("./testCss.css", css, "utf8");
        console.log("CSS written");
    });
}
testGenerate();
//# sourceMappingURL=css.js.map