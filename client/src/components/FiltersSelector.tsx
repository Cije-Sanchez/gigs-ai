import { Label } from "./ui/label";
import { ColumnsList } from "./ColumnList";

export function FiltersSelector() {
  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="daysofdata">Columns</Label>
        </div>
        <div>
          <ColumnsList />
        </div>
      </div>
    </div>
  );
}
