import { Toolbar } from "../UI/Toolbar";
import type { UIStrings } from "../UI/UIStrings";

const examples: string[] = ["Example1", "Example2"];

export interface ToolbarPlaygroundProps {
  uiString: UIStrings;
}

export function ToolbarPlayground(props: ToolbarPlaygroundProps): JSX.Element {
  const { uiString } = props;

  return (
    <>
      <div>Standard Toolbar:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"IDLE"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>

      <hr />

      <div>EXECUTE_INSTRUCTION:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"EXECUTE_INSTRUCTION"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>FETCH_INSTRUCTION:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"FETCH_INSTRUCTION"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>SINGLE_STEP:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"SINGLE_STEP"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>RUN:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"RUN"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>STOPPING:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"STOPPING"}
          resetEnabled={true}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>

      <hr />

      <div>No Source File:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
          resetEnabled={true}
          examples={[]}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>Source File:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
          resetEnabled={true}
          examples={[]}
          sourceFile={{
            filename: "example.asm",
            info: {
              kind: "ValidSourceFile",
              id: "Example.asm",
              hasErrors: false,
            },
          }}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>Source File with errors:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
          resetEnabled={true}
          examples={[]}
          sourceFile={{
            filename: "example.asm",
            info: {
              kind: "ValidSourceFile",
              id: "Example.asm",
              hasErrors: true,
            },
          }}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>Invalid Source File:</div>
      <div>
        <Toolbar
          uiString={uiString}
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
          resetEnabled={true}
          examples={[]}
          sourceFile={{
            filename: "example.py",
            info: {
              kind: "InvalidSourceFile",
              languageId: "plaintext",
            },
          }}
          animationSpeed={"MEDIUM"}
        />
      </div>
    </>
  );
}
