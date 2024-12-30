import { Input } from "@/components/ui/input";
import { GlobalStateContext } from "@/Contexts";
import { TMessages } from "@/GlobalState";
import { createMessageServer } from "@/lib/server";
import { RefObject, useContext, useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export const Form = ({
  upperContainerRef,
}: {
  upperContainerRef: RefObject<HTMLDivElement>;
}) => {
  const {
    messages,
    setMessages,
    chatId,
    daysOfDataValue,
    sources,
    setTables,
    tables,
  } = useContext(GlobalStateContext)!;
  const [messageFieldValue, setMessageFieldValue] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      resizeForm(formRef, upperContainerRef);
    };
    resizeForm(formRef, upperContainerRef);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [upperContainerRef]);

  const handleSendMessage = async () => {
    if (isWorking) return toast.message("Already generating a response");
    if (!chatId) return toast.message("ChatId not set yet");
    if (messageFieldValue === "") return toast.message("Empty Message");

    const newMessages: TMessages = [
      ...messages,
      {
        role: "user",
        content: messageFieldValue,
      },
    ];
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: messageFieldValue,
      },
    ]);

    setIsWorking(true);

    try {
      const sourcesFinal = sources
        .filter((source) => source.isActive)
        .map((source) => source.source);
      const daysOfDataFinal =
        daysOfDataValue.length > 0 ? daysOfDataValue[0] : 3;

      const {
        error: createMessageError,
        messages: createMessageMessages,
        chatID: createMessageChatID,
        searchResults: createMessageSearchResults,
      } = await createMessageServer(
        chatId,
        newMessages,
        sourcesFinal,
        daysOfDataFinal,
      );

      if (createMessageError) throw new Error(createMessageError);
      if (
        !(
          createMessageChatID &&
          createMessageMessages &&
          createMessageSearchResults
        )
      )
        throw new Error("Something wrong in the middleend");

      setMessages(createMessageMessages);
      const newTableList = [...tables];
      newTableList.push({
        messageIndex: createMessageMessages.length - 1,
        table: createMessageSearchResults,
      });
      setTables(newTableList);
    } catch (error) {
      const { message: errorMessage } = error as Error;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
      console.error("Error:", errorMessage);
    } finally {
      setIsWorking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div ref={formRef} className="relative w-full">
      <Input
        placeholder="Message GigsAI..."
        className="border-[1px] border-neutral-500 ring-none rounded-xl bg-inherit placeholder:text-neutral-400 h-12"
        value={messageFieldValue}
        onChange={(e) => setMessageFieldValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

function resizeForm(
  formRef: RefObject<HTMLDivElement>,
  upperContainerRef: RefObject<HTMLDivElement>,
) {
  if (formRef.current && upperContainerRef.current) {
    const { width: upperContainerWidth } =
      upperContainerRef.current.getBoundingClientRect();
    formRef.current.style.width = `${upperContainerWidth}px`;
  }
}
