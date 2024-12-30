import { Job, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { Router, Response } from "express";
import {
  CREATE_FINE_TUNING_USER_MESSAGE,
  CREATE_FIRST_TIME_USER_MESSAGE,
  FIRST_TIME_SYSTEM_PROMPT,
} from "../utils/promptsv2";
import { getModel, mockSearchJobs, searchJobs } from "../utils/model";
import { io } from "..";
const chatRouter = Router();

type TCreateMessageResponse = {
  chatID: string | null;
  error: string | null;
  messages: TMessages;
  searchResults: Job[] | null;
};
export type TMessages =
  | { role: "user" | "assistant"; content: string }[]
  | null;

chatRouter.post("/createMessage", async (req, res) => {
  console.log(`Received request from ${req.ip}`);
  try {
    let { chatID }: { chatID: string } = req.body;
    const { messages }: { messages: TMessages } = req.body;
    const { sourceFilter, daysofDataFilter } = req.body;

    const systemMessage: { role: "system"; content: string } = {
      role: "system",
      content: FIRST_TIME_SYSTEM_PROMPT,
    };
    if (!messages) throw new Error("Messages is null");

    const userMessages = messages
      .filter((value) => value.role == "user")
      .map((value) => {
        return value.content;
      });

    let userMessage = "";
    if (userMessages.length == 0) throw new Error("Empty user messages?");
    const model = getModel("self");

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
    const jobs = await mockSearchJobs(prisma);

    const chunks = jobs.map((value: any) => value.chunk);

    if (userMessages.length > 1) {
      userMessage = CREATE_FINE_TUNING_USER_MESSAGE(userMessages, chunks);
    } else {
      userMessage = CREATE_FIRST_TIME_USER_MESSAGE(userMessages[0], chunks);
    }

    const stream = await model.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, { role: "user", content: userMessage }],
      stream: true,
    });

    let streamResponse: { role: "assistant"; content: string } = {
      role: "assistant",
      content: "",
    };
    io.emit("gigsGptResChunk", { chatID: chatID, content: "." });

    for await (const streamUnit of stream) {
      try {
        const chunk = streamUnit.choices[0]?.delta?.content || "";
        if (chunk) {
          streamResponse.content += chunk;
          io.emit("gigsGptResChunk", {
            chatID: chatID,
            content: streamResponse.content,
          });
        }
      } catch (error) {
        const { message: errorMessage } = error as Error;
        console.log(errorMessage);
        io.emit("resError", { chatID: chatID, error: errorMessage });
      }
    }

    const newMessageList = JSON.parse(JSON.stringify(messages)) as {
      role: "user" | "assistant";
      content: string;
    }[];
    newMessageList.push(streamResponse);
    const response: TCreateMessageResponse = {
      messages: newMessageList,
      error: null,
      chatID: chatID,
      searchResults: jobs,
    };
    console.log(`Finsihed request from ${req.ip}`);
    res.status(200).json(response);
  } catch (error) {
    const { message: errorMessage } = error as Error;
    const response: TCreateMessageResponse = {
      chatID: null,
      error: errorMessage,
      messages: null,
      searchResults: null,
    };
    console.log(errorMessage);
    console.log(`Failed request from ${req.ip}`);
    res.status(505).json(response);
  }
});

export default chatRouter;
