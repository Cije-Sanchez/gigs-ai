import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { IconGitHub, IconSparkles } from "./Icons";
import { ThemeToggle } from "./ThemeToogle";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-8  h-14 shrink-0  backdrop-blur-xl border-b border-accent">
      <span className="inline-flex items-center home-links ">
        <MobileMenu />
        <Link to="/">
          <span className="text-lg flex items-center">
            GigsAI
            <IconSparkles className="inline mr-0 ml-0.5 w-4 sm:w-5 mb-1" />
          </span>
        </Link>
      </span>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="ghost" size={"icon"} asChild>
          <a
            target="_blank"
            href="https://github.com/CijeTheCreator/brightdata-job-search"
            rel="noopener noreferrer"
          >
            <IconGitHub />
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
