import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ResponsiveContainer } from "recharts";
import SidebarForm from "./FilterSortForm";

export function MobileMenu() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Menu className="md:hidden mr-4 cursor-pointer" />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Chat Options</DrawerTitle>
          </DrawerHeader>
          <div className="mt-3">
            <ResponsiveContainer className={"p-4"} width="100%" height="100%">
              <SidebarForm />
            </ResponsiveContainer>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
