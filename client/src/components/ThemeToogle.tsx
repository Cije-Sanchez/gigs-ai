import * as React from "react";

import { Button } from "@/components/ui/button";
import { IconMoon, IconSun } from "./Icons";
import { GlobalStateContext } from "@/Contexts";

export function ThemeToggle() {
  // const { setTheme, theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = React.useTransition();
  const { theme, toggleTheme } = React.useContext(GlobalStateContext)!;

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  if (!isClient) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        startTransition(() => {
          toggleTheme(theme);
        });
      }}
    >
      {!theme ? null : theme === "dark" ? (
        <IconMoon className="transition-all" />
      ) : (
        <IconSun className="transition-all" />
      )}
    </Button>
  );
}
