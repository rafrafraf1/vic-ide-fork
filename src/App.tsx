import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { type ComputerState, newComputerState } from "./Computer/Computer";
import { Computer } from "./UI/Computer";

function App(): JSX.Element {
  const computer = React.useRef<ComputerState>(newComputerState());

  return (
    <div className="App-Root">
      <div className="App-Toolbar-Cont">VIC Toolbar</div>
      <Computer className="App-Computer-Cont" computer={computer.current} />
    </div>
  );
}

export default App;
