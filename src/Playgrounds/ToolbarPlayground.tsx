import { Toolbar } from "../UI/Toolbar";

const examples: string[] = ["Example1", "Example2"];

export function ToolbarPlayground(): JSX.Element {
  return (
    <>
      <div>Standard Toolbar:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"IDLE"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>

      <hr />

      <div>EXECUTE_INSTRUCTION:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"EXECUTE_INSTRUCTION"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>FETCH_INSTRUCTION:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"FETCH_INSTRUCTION"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>SINGLE_STEP:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"SINGLE_STEP"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>RUN:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"RUN"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>STOPPING:</div>
      <div>
        <Toolbar
          showThemeSwitcher={true}
          showExamples={true}
          showSourceLoader={true}
          simulationState={"STOPPING"}
          examples={examples}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>

      <hr />

      <div>No Source File:</div>
      <div>
        <Toolbar
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
          examples={[]}
          sourceFile={null}
          animationSpeed={"MEDIUM"}
        />
      </div>
      <div>Source File:</div>
      <div>
        <Toolbar
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
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
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
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
          showThemeSwitcher={false}
          showExamples={false}
          showSourceLoader={true}
          simulationState={"IDLE"}
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
