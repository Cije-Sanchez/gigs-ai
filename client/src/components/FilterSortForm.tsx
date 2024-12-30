import { Form } from "@/components/ui/form";
import { GlobalStateContext } from "@/Contexts";
import { useContext } from "react";
import { SourcesSelector } from "./SourceSelector";
import { DaysofDataSelector } from "./DaysofDataSelector";
import { ColumnsSelector } from "./ColumnsSelector";

export type FilterColumn = {
  id: string;
  label: string;
};
export default function SidebarForm() {
  const globalContext = useContext(GlobalStateContext);
  const { form } = globalContext!;
  return (
    <Form {...form}>
      <form className="space-y-8 flex-shrink-0 w-64">
        <div className="flex-col space-y-4 sm:flex ">
          <SourcesSelector />
          <DaysofDataSelector />
          <ColumnsSelector />
          {/* <div className="flex items-center space-x-2"> */}
          {/*   <Button>Submit</Button> */}
          {/* </div> */}
        </div>
      </form>
    </Form>
  );
}
