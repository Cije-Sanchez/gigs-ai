import postcss from "postcss";
import tailwindcss from "tailwindcss";
import fs from "fs";

type TGenerateCSS = {
  css: string | null;
  error: string | null;
};
export async function generateCssFromHtml(
  htmlContent: string,
): Promise<TGenerateCSS> {
  const config = {
    content: [{ raw: htmlContent, extension: "html" }],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  const processor = postcss([tailwindcss(config)]);
  try {
    const result = await processor.process(
      "@tailwind base; @tailwind components; @tailwind utilities;",
      {
        from: undefined,
      },
    );
    const css = result.css;
    return {
      css,
      error: null,
    };
  } catch (error) {
    const catchError = error as Error;
    return {
      css: null,
      error: catchError.message,
    };
  }
}

async function testGenerate() {
  const testHtml = `
<div class="flex items-center justify-center p-8 w-[500px] h-[500px] bg-red-500">
  <div class="bg-black text-white p-8 rounded">
    This is a centered particle.
  </div>
</div>

`;
  const { css } = await generateCssFromHtml(testHtml);
  if (!css) return;
  fs.writeFileSync("./testCss.css", css, "utf8");
  console.log("CSS written");
}
testGenerate();
