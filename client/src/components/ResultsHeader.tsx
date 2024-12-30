import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import jobIcon from "/job-icon.png";
import { XIcon, SearchIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToogle";
import { Button } from "./ui/button";
import { IconGitHub } from "./Icons";
import { toast } from "sonner";

function Header() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const headerTerm = searchParams.get("term");

  function handleSearch(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!searchInputRef.current) return;
    e.preventDefault();
    const term = searchInputRef.current.value;
    if (!term) return toast.error("Invalid Search term");
    navigate(`/jobs?term=${encodeURIComponent(term)}`);
  }
  return (
    <header className="sticky top-0 bg-white  z-40">
      <div className="flex w-full  items-center container justify-between">
        <div className="flex flex-grow items-center">
          <img
            className="cursor-pointer w-8 h-8"
            src="/job-icon.png"
            alt="Jobs Icon"
            onClick={() => navigate("/")}
          />
          <form className="flex flex-grow h-12 px-6 py-3 ml-10 mr-5 border border-gray-200 rounded-full shadow-lg max-w-2xl items-center">
            <input
              ref={searchInputRef}
              className="flex-grow w-full focus:outline-none"
              type="text"
              defaultValue={headerTerm || ""}
            />
            <XIcon
              className="h-7 sm:mr-3 text-gray-500 cursor-pointer transition transform hover:scale-125"
              onClick={() => {
                if (!searchInputRef.current) return;
                searchInputRef.current.value = "";
              }}
            />
            <SearchIcon className="h-6 text-blue-500 hidden sm:inline-flex" />
            <button hidden={true} type="submit" onClick={handleSearch}>
              Search
            </button>
          </form>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <ThemeToggle />

          <Button variant="ghost" size={"icon"} asChild>
            <a
              target="_blank"
              href="https://github.com/CijeTheCreator/job-search"
              rel="noopener noreferrer"
            >
              <IconGitHub />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
export default Header;
