import { useContext, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { SingleJobHeader } from "./SingleJobHeader";
import { SingleJobDescription } from "./SingleJobDescription";
import { SingleJobMoneyExperience } from "./SingleJobMoneyExperience";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { GlobalStateContext } from "@/Contexts";
import { Link } from "react-router-dom";

export function SingleJobSlideOver() {
  const { jobOverlayOpen, setJobOverlayOpen, activeJob } =
    useContext(GlobalStateContext)!;
  function toggleSlideover() {
    setJobOverlayOpen(!jobOverlayOpen);
  }

  const slideoverContainerRef = useRef<HTMLDivElement>(null);
  const slideoverBackgroundRef = useRef<HTMLDivElement>(null);
  const slideOverRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={slideoverContainerRef}
      id="slideover-container"
      className={`w-full h-full fixed inset-0 z-50 ${jobOverlayOpen ? "" : "invisible"}`}
    >
      <div
        ref={slideoverBackgroundRef}
        onClick={() => toggleSlideover()}
        id="slideover-bg"
        className={`w-full h-full duration-500 ease-out transition-all inset-0 absolute bg-gray-900 ${jobOverlayOpen ? "opacity-50" : "opacity-0"}`}
      ></div>
      <div
        ref={slideOverRef}
        onClick={() => toggleSlideover()}
        id="slideover"
        className={`w-3/4 bg-white h-full absolute right-0 duration-300 ease-out transition-all p-6 ${jobOverlayOpen ? "" : "translate-x-full"}`}
      >
        <div className="flex flex-row cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <SingleJobHeader />
          <Separator />
          <SingleJobDescription />
          <Separator />
          <SingleJobMoneyExperience />
        </div>
      </div>
      <Link to={activeJob?.link || "/"} target={"_blank"}>
        <Button className="mt-2 fixed bottom-5 right-5 scale-150 -translate-y-1/2 -translate-x-1/2">
          Apply Now
        </Button>
      </Link>
    </div>
  );
}
