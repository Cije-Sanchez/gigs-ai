import { GlobalStateContext } from "@/Contexts";
import { Check } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function ColumnsSelector() {
  const globalContext = React.useContext(GlobalStateContext);
  const { columns, setColumns } = globalContext!;
  useEffect(() => {
    const columns_ = [
      {
        id: "source",
        label: "Source",
        isActive: true,
      },
      {
        id: "title",
        label: "Title",
        isActive: true,
      },
      {
        id: "location",
        label: "Location",
        isActive: true,
      },
      {
        id: "link",
        label: "Link",
        isActive: true,
      },
      {
        id: "compensation",
        label: "Compensation",
        isActive: true,
      },
    ];
    setColumns(columns_);
  }, [setColumns]);
  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Columns</Label>
        </div>
        <div className="flex gap-2 flex-row flex-wrap">
          {columns.map((source, index) => {
            return (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  const newSourceList = columns.map((s, i) =>
                    i === index ? { ...s, isActive: !s.isActive } : s,
                  );
                  setColumns(newSourceList);
                }}
                variant={"outline"}
              >
                {source.label}
                {source.isActive && <Check />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
