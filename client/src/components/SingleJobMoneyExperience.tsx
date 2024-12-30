import { GlobalStateContext } from "@/Contexts";
import { Brain, HandCoinsIcon } from "lucide-react";
import { useContext } from "react";
export function SingleJobMoneyExperience() {
  const { activeJob } = useContext(GlobalStateContext)!;
  return (
    <div className="flex flex-row gap-8 py-8 items-start">
      <div className="flex flex-row items-start gap-2">
        <HandCoinsIcon />
        <div className="flex flex-col w-36">
          <div className="font-semibold">${activeJob?.compensation}</div>
          {/* TODO: Format later */}
          <div className="text-accent">{"Fixed price"}</div>
        </div>
      </div>
      <div className="flex flex-row items-start gap-2">
        <Brain />
        <div className="flex flex-col w-36">
          <div className="font-semibold">{activeJob?.experienceLevel}</div>
          <div className="text-accent">
            {/* TODO: Format later */}I am looking for freelancers with the
            lowest rates
          </div>
        </div>
      </div>
    </div>
  );
}
