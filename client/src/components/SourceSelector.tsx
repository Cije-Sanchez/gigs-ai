import * as React from "react";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { GlobalStateContext } from "@/Contexts";
import { Label } from "./ui/label";

export function SourcesSelector() {
  const globalContext = React.useContext(GlobalStateContext);
  const { sources, setSources } = globalContext!;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  React.useEffect(() => {
    const Gsources = [
      {
        source: "Upwork",
        isActive: true,
      },
      {
        source: "Freelancer",
        isActive: true,
      },
    ];
    setSources(Gsources);
  }, [setSources]);
  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Sources</Label>
        </div>
        <div className="flex gap-2 flex-row flex-wrap">
          {sources.map((source, index) => {
            return (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  const newSourceList = sources.map((s, i) =>
                    i === index ? { ...s, isActive: !s.isActive } : s,
                  );

                  setSources(newSourceList);
                }}
                variant={"outline"}
              >
                {source.source}
                {source.isActive && <Check />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
