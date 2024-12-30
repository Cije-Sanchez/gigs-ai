import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, SquarePen } from "lucide-react";
import { SheetTrigger, SheetContent, Sheet } from "./ui/sheet";

export const MobileSidebar = () => {
  return (
    <div className="block lg:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu className="text-white" />
        </SheetTrigger>
        <SheetContent side={"left"} className="h-full flex p-4  flex-col">
          <NewChatButton />
          <ChatList />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export const NewChatButton = () => {
  const handleAdd = () => {};

  return (
    <Button
      className="w-full flex justify-start items-center bg-inherit hover:bg-inherit p-0"
      onClick={handleAdd}
    >
      <PlusCircle className="w-5 h-5" />
      <p className="font-semibold text-start ml-3">New Chat</p>
      <SquarePen className="w-4 h-4 ml-auto" />
    </Button>
  );
};

export const ChatList = () => {
  const chats: {
    _id: string;
    title: string;
  }[] = [];
  const chatId = "";
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatBox key={chat._id} chat={chat} selected={chat._id === chatId} />
      ))}
    </div>
  );
};

export const ChatBox = ({
  chat,
  selected,
}: {
  chat: { title: string };
  selected: boolean;
}) => {
  // const [isEditing, setIsEditing] = useState(false);
  // const [title, setTitle] = useState(chat.title);

  const hadleClick = () => {
    if (!selected) {
      // router.push(`/chat/${chat._id}`);
    }
  };

  return (
    <div
      key={chat.title}
      className={cn(
        "group relative flex w-full p-2 rounded-md  cursor-pointer text-white text-sm",
        selected && "",
      )}
      onClick={hadleClick}
    >
      <div className="truncate max-w-[200px]">{chat.title}</div>
    </div>
  );
};
