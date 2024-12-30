import { RefObject, useEffect, useRef } from "react";
import { Body } from "./Body";
import { Form } from "./Form";

const Chat = () => {
  const upperContainerRef = useRef<HTMLDivElement>(null);
  const lowerContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleReposition() {
      repositionContainer(lowerContainerRef, upperContainerRef);
    }
    repositionContainer(lowerContainerRef, upperContainerRef);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("resize", handleReposition);
    };
  }, [upperContainerRef]);
  return (
    <div className=" w-full h-full flex flex-col items-center">
      <div
        className="flex flex-col gap-4 md:gap-0 items-center h-full w-full"
        ref={upperContainerRef}
      >
        <Body />
        <div className="pb-4 w-full fixed bottom-0" ref={lowerContainerRef}>
          <Form upperContainerRef={upperContainerRef} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
function repositionContainer(
  lowerContainerRef: RefObject<HTMLDivElement>,
  upperContainerRef: RefObject<HTMLDivElement>,
) {
  if (lowerContainerRef.current && upperContainerRef.current) {
    const { width: upperContainerWidth, x } =
      upperContainerRef.current.getBoundingClientRect();
    lowerContainerRef.current.style.width = `${upperContainerWidth}px`;
    lowerContainerRef.current.style.left = `${x}px`;
  }
}
