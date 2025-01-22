import type { StreamParser, StringStream } from "@codemirror/language";

/* eslint-disable prefer-named-capture-group */

type StateType =
  | "START"
  | "LINE_TAIL"
  | "GOTO_INSTRUCTION"
  | "VAR_INSTRUCTION"
  | "COMMENT";

interface State {
  current: StateType;
}

const TOKEN_COMMENT = "comment";
const TOKEN_LABEL = "labelName";
const TOKEN_INSTRUCTION = "keyword";
const TOKEN_VARIABLE = "typeName";
const TOKEN_CONSTANT = "string";

export const vicAsmStreamParser: StreamParser<State> = {
  name: "vic-asm",
  startState: (): State => {
    return {
      current: "START",
    };
  },

  token: (stream: StringStream, state: State): string | null => {
    if (state.current === "COMMENT") {
      stream.skipToEnd();
      state.current = "START";
      return TOKEN_COMMENT;
    }

    stream.eatSpace();

    if (state.current === "GOTO_INSTRUCTION") {
      stream.eatSpace();
      if (stream.eol()) {
        state.current = "START";
        return null;
      }
      if (stream.match(/\w+/) !== null) {
        state.current = stream.eol() ? "START" : "LINE_TAIL";
        return TOKEN_LABEL;
      }
      state.current = "LINE_TAIL";
      return null;
    }

    if (state.current === "VAR_INSTRUCTION") {
      stream.eatSpace();
      if (stream.eol()) {
        state.current = "START";
        return null;
      }
      const w = stream.match(/\w+/);
      if (w !== null && typeof w === "object") {
        state.current = stream.eol() ? "START" : "LINE_TAIL";
        switch (w[0].toLowerCase()) {
          case "one":
          case "zero":
            return TOKEN_CONSTANT;
          default:
            return TOKEN_VARIABLE;
        }
      }
      state.current = "LINE_TAIL";
      return null;
    }

    if (state.current === "LINE_TAIL") {
      if (stream.match(/^.*?\/\//) !== null) {
        stream.backUp(2);
        state.current = "COMMENT";
      } else {
        state.current = "START";
        stream.skipToEnd();
      }
      return null;
    }

    // Check for label
    if (stream.match(/^(\w+):/) !== null) {
      stream.backUp(1);
      state.current = "LINE_TAIL";
      return TOKEN_LABEL;
    }

    // Check for instruction
    const w = stream.match(/^(\w+)/);
    if (w !== null && typeof w === "object") {
      switch (w[0].toLowerCase()) {
        case "read":
        case "write":
        case "stop":
          if (!stream.eol()) {
            state.current = "LINE_TAIL";
          }
          return TOKEN_INSTRUCTION;
        case "goto":
        case "gotop":
        case "gotoz":
          if (!stream.eol()) {
            state.current = "GOTO_INSTRUCTION";
          }
          return TOKEN_INSTRUCTION;
        case "add":
        case "sub":
        case "load":
        case "store":
          if (!stream.eol()) {
            state.current = "VAR_INSTRUCTION";
          }
          return TOKEN_INSTRUCTION;
        default:
          break;
      }
    }
    if (!stream.eol()) {
      state.current = "LINE_TAIL";
    }
    return null;
  },
};
