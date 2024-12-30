import * as React from "react";
import { Label } from "./ui/label";
import { GlobalStateContext } from "@/Contexts";
import { Slider } from "./ui/slider";

export function DaysofDataSelector() {
  const globalContext = React.useContext(GlobalStateContext);
  const { daysOfDataValue, setDaysOfDataValue } = globalContext!;
  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="daysofdata">Days of Data</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {daysOfDataValue}
          </span>
        </div>
        <Slider
          id="daysofdata"
          defaultValue={daysOfDataValue}
          max={7}
          onValueChange={setDaysOfDataValue}
          step={1}
          className="w-[60%]"
        />
      </div>
    </div>
  );
}
