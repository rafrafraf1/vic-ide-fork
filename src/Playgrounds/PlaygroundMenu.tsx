import "./PlaygroundMenu.css";

import * as React from "react";

import { assertNever } from "assert-never";

import { Button, ButtonLabel } from "../UI/Components/Button";
import { ThemeSwitcher } from "../UI/Toolbar";
import { EnglishStrings } from "../UI/UIStrings";
import { ToolbarPlayground } from "./ToolbarPlayground";
import { ValueCellInputPlayground } from "./ValueCellInputPlayground";

type Playground = "None" | "ValueCellInputPlayground" | "ToolbarPlayground";

const uiStrings = EnglishStrings;

const allPlaygrounds: Playground[] = [
  "None",
  "ValueCellInputPlayground",
  "ToolbarPlayground",
];

export function PlaygroundMenu(): React.JSX.Element {
  const [playground, setPlayground] = React.useState<Playground>("None");

  return (
    <>
      <div className="PlaygroundMenu-menu">
        <ThemeSwitcher />
        {allPlaygrounds.map((playground, index) => (
          <Button
            key={index}
            onClick={(): void => {
              setPlayground(playground);
            }}
          >
            <ButtonLabel>{playground}</ButtonLabel>
          </Button>
        ))}
      </div>
      <div className="PlaygroundMenu-activity-root">
        <PlaygroundActivity playground={playground} />
      </div>
    </>
  );
}

interface PlaygroundActivityProps {
  playground: Playground;
}

function PlaygroundActivity(props: PlaygroundActivityProps): React.JSX.Element {
  const { playground } = props;

  switch (playground) {
    case "None":
      return <div>Click a button above</div>;
    case "ValueCellInputPlayground":
      return <ValueCellInputPlayground />;
    case "ToolbarPlayground":
      return <ToolbarPlayground uiString={uiStrings} />;
    default:
      return assertNever(playground);
  }
}
