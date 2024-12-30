import { useNavigate } from "react-router-dom";
import { GlobalStateContext } from "@/Contexts";
import { Search } from "lucide-react";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
// import appIcon from "/job-icon.png";

export default function Home() {
  const navigate = useNavigate();
  const context = useContext(GlobalStateContext);
  const { searchInputRef } = context!;

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!searchInputRef.current) return;
    e.preventDefault();
    const term = searchInputRef.current.value;
    if (!term) return;
    navigate(`/jobs?term=${encodeURIComponent(term)}`);
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form className="flex flex-col items-center mt-20 flex-grow w-4/5">
        <img src="/job-icon.png" alt="App Icon" className="w-[140px]" />

        <div className="flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl">
          <Search className="h-5 mr-3 text-gray-500" />
          <input
            className="flex-grow focus:outline-none"
            ref={searchInputRef}
            type="text"
          />
        </div>
        <div className="flex flex-col w-1/2 space-y-2 justify-center mt-8 sm:space-y-0 sm:flex-row sm:space-x-4">
          <Button
            variant={"outline"}
            className="scale-125"
            onClick={handleSearch}
          >
            Search Jobs
          </Button>
        </div>
      </form>
    </div>
  );
}
