import { useContext, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemoizedReactMarkdown } from "./MemoizedReactMarkdown";
import { ScrollArea } from "./ui/scroll-area";
import { GlobalStateContext } from "@/Contexts";
import { JobTable } from "./JobTable";
import { columns } from "@/components/Columns";

export const Body = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any
  const scrollRef = useRef<HTMLDivElement>(null);
  // const { socket, setMessages, chatId, scrolledToBottom } =
  //   useContext(GlobalStateContext)!;
  const { socket, setMessages, chatId, scrolledToBottom, messages } =
    useContext(GlobalStateContext)!;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    socket.on(
      "gigsGptResChunk",
      (data: { chatID: string; content: string }) => {
        if (data.chatID !== chatId) return;
        setMessages((prevMessages) => {
          if (!prevMessages) return [];
          if (scrolledToBottom) scrollToBottom();
          if (prevMessages[prevMessages.length - 1]?.role === "user") {
            return [
              ...prevMessages,
              { role: "assistant", content: data.content },
            ];
          }
          return [
            ...prevMessages.slice(0, -1),
            { role: "assistant", content: data.content },
          ];
        });
      },
    );

    socket.on("resError", (data: { chatID: string; error: unknown }) => {
      console.log("Res Error");
      if (!(data.chatID === chatId)) return;
      if (scrolledToBottom) {
        scrollToBottom();
      }
      setMessages((prevMessages) => {
        if (prevMessages[prevMessages.length - 1]?.role === "user") {
          return [
            ...prevMessages,
            { role: "assistant", content: "Error: " + data.error },
          ];
        }
        return [
          ...prevMessages.slice(0, -1),
          { role: "assistant", content: "Error: " + data.error },
        ];
      });
    });
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log("Log: ", messages);
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <ScrollArea className="max-h-[calc(100%-90px)] w-full flex-1">
        <div className="relative">
          {messages.map((message, index) => {
            console.log("Mapping ", message);
            return (
              <div className="flex flex-col items-start">
                <MessageBox key={index} message={message} index={index} />
              </div>
            );
          })}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>
    </>
  );
};

export const MessageBox = ({
  message,
  index,
}: {
  message: { role: string; content: string };
  index: number;
}) => {
  const nameString = message.role === "user" ? "You" : "GigsAI";
  const imageUrl = "/logo.svg";

  const { tables } = useContext(GlobalStateContext)!;
  function getTableData(index: number) {
    const table = tables.find((table) => table.messageIndex == index);
    if (!table) return -1;
    return table.table;
  }
  return (
    <div className="flex space-x-3 items-start mb-10 max-w-[calc(80%)] md:max-w-full text-wrap">
      <Avatar className="w-7 h-7 text-white fill-white">
        <AvatarImage src={imageUrl} className="text-white fill-white" />
        <AvatarFallback className="text-neutral-900 font-semibold">
          {nameString[0]}
        </AvatarFallback>
      </Avatar>
      <div className="">
        <h3 className="font-bold">{nameString}</h3>
        <div className="flex flex-grow flex-col gap-3 gap-y-5">
          <MemoizedReactMarkdown>{message.content}</MemoizedReactMarkdown>

          {message.role == "assistant" && getTableData(index) != -1 && (
            <JobTable
              columns={columns}
              data={getTableData(index) as []}
              className={""}
            />
          )}
        </div>
      </div>
    </div>
  );
};
