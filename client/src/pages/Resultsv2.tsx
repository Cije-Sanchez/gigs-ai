import Chat from "@/components/ChatUI";
import SidebarForm from "@/components/FilterSortForm";
import { Navbar } from "@/components/Navbar";
import { SingleJobSlideOver } from "@/components/SingleJob";
import { Card, CardContent } from "@/components/ui/card";
import { GlobalStateContext } from "@/Contexts";
import { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {} from "lucide-react";

export default function JobPage() {
  const { setChatId } = useContext(GlobalStateContext)!;
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const chatID = searchParams.get("chatID");
    if (chatID) {
      setChatId(chatID);
    } else {
      const newChatID = uuidv4();
      setChatId(newChatID);
      setSearchParams({
        chatID: newChatID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Get messages?
  return (
    <>
      {/* <Header /> */}
      <Navbar />
      <div className="h-full flex-col md:flex">
        <div defaultValue="complete" className="flex-1">
          <div className="container h-[calc(100dvh-7.5rem)]">
            <div className="flex h-full items-stretch gap-6 flex-row my-8 ">
              <div className="">
                <Card className="hidden md:block">
                  <CardContent className="space-y-2 my-8">
                    <SidebarForm />
                  </CardContent>
                </Card>
              </div>
              <div className="flex-grow">
                <div className="mt-0 border-0 p-0 h-full">
                  <div className="flex h-full flex-col space-y-4">
                    <Chat />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SingleJobSlideOver />
    </>
  );
}
