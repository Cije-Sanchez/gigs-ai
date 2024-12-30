import { MobileSidebar } from "./MobileSidebar";

export const Header = () => {
  return (
    <div className="lg:hidden md:hidden flex h-[100px] justify-between p-5">
      <MobileSidebar />
    </div>
  );
};
