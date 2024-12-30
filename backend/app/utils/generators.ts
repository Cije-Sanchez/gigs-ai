import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

export async function generatePromptResponse(
  openai: OpenAI,
  systemMessage: string,
  userMessages: string[],
  model: string = "gpt-4o-mini",
  userSystemMixedMessages:
    | { role: "system" | "user"; content: string }[]
    | null = null,
): Promise<string | null> {
  const userMessagesPresented = userMessages.map((userMessage) => {
    return {
      role: "user",
      content: userMessage,
    } as const;
  });

  const systemMessagePresented = {
    role: "system",
    content: systemMessage,
  } as const;

  let messages: { role: "system" | "user"; content: string }[];
  if (userSystemMixedMessages) {
    const mixedMessages = userSystemMixedMessages.map((mixedMessage) => {
      return {
        role: mixedMessage.role,
        content: mixedMessage.content,
      } as const;
    });
    messages = mixedMessages;
  } else {
    messages = [systemMessagePresented, ...userMessagesPresented];
  }

  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_completion_tokens: 600,
  });

  const generation = completion.choices[0].message.content;
  return generation;
}
