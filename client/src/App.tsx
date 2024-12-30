/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext } from "react";
import "./App.css";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GlobalStateContext } from "./Contexts";
import JobPage from "./pages/Resultsv2";
// import Home from "./pages/SearchHome";

function App() {
  const { theme } = useContext(GlobalStateContext)!;
  return (
    <div data-theme={theme} className={"flex flex-col  " + theme}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Home />}></Route> */}
          <Route path="/" element={<JobPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
