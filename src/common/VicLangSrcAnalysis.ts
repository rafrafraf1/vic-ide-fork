import { type SrcLoc, type SrcPos, srcPosWithinSrcLoc } from "./SrcLoc";
import { type Statement, instructionArgKind } from "./VicLangParser";
import { assertNever } from "assert-never";

/**
 * Get the location of all the occurences of a symbol.
 *
 * This is used for the VS Code extension "DocumentHighlightProvider"
 * functionality.
 *
 * See:
 * <https://code.visualstudio.com/api/language-extensions/programmatic-language-features#highlight-all-occurrences-of-a-symbol-in-a-document>
 */
export function getHighlights(statements: Statement[], pos: SrcPos): SrcLoc[] {
  const symbol = lookupSymbol(statements, pos);
  if (symbol === null) {
    return [];
  }

  switch (symbol.kind) {
    case "Label":
      return getLabelHighlights(statements, symbol.name);
    case "Variable":
      return getVariableHighlights(statements, symbol.name);
    /* istanbul ignore next */
    default:
      return assertNever(symbol);
  }
}

type SymbolResult = SymbolResult.Label | SymbolResult.Variable;

namespace SymbolResult {
  export interface Label {
    kind: "Label";
    name: string;
  }

  export interface Variable {
    kind: "Variable";
    name: string;
  }
}

function lookupSymbol(
  statements: Statement[],
  pos: SrcPos
): SymbolResult | null {
  for (const statement of statements) {
    switch (statement.kind) {
      case "Label":
        if (srcPosWithinSrcLoc(pos, statement.srcLoc)) {
          return {
            kind: "Label",
            name: statement.labelName,
          };
        }
        break;
      case "NullaryInstruction":
        break;
      case "UnaryInstruction":
        if (
          statement.arg !== null &&
          srcPosWithinSrcLoc(pos, statement.arg.srcLoc)
        ) {
          const argKind = instructionArgKind(statement.instructionVal);
          switch (argKind) {
            case "LABEL":
              return {
                kind: "Label",
                name: statement.arg.name,
              };
            case "VARIABLE":
              return {
                kind: "Variable",
                name: statement.arg.name,
              };
            /* istanbul ignore next */
            default:
              return assertNever(argKind);
          }
        }
        break;
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  return null;
}

function getLabelHighlights(statements: Statement[], name: string): SrcLoc[] {
  const labelLower = name.toLowerCase();

  const result: SrcLoc[] = [];

  for (const statement of statements) {
    switch (statement.kind) {
      case "Label":
        if (statement.labelName.toLowerCase() === labelLower) {
          result.push(statement.srcLoc);
        }
        break;
      case "NullaryInstruction":
        break;
      case "UnaryInstruction": {
        const argKind = instructionArgKind(statement.instructionVal);
        switch (argKind) {
          case "LABEL":
            if (
              statement.arg !== null &&
              statement.arg.name.toLowerCase() === labelLower
            ) {
              result.push(statement.arg.srcLoc);
            }
            break;
          case "VARIABLE":
            break;
          /* istanbul ignore next */
          default:
            return assertNever(argKind);
        }
        break;
      }
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  return result;
}

function getVariableHighlights(
  statements: Statement[],
  name: string
): SrcLoc[] {
  const variableLower = name.toLowerCase();

  const result: SrcLoc[] = [];

  for (const statement of statements) {
    switch (statement.kind) {
      case "Label":
        break;
      case "NullaryInstruction":
        break;
      case "UnaryInstruction": {
        const argKind = instructionArgKind(statement.instructionVal);
        switch (argKind) {
          case "LABEL":
            break;
          case "VARIABLE":
            if (
              statement.arg !== null &&
              statement.arg.name.toLowerCase() === variableLower
            ) {
              result.push(statement.arg.srcLoc);
            }
            break;
          /* istanbul ignore next */
          default:
            return assertNever(argKind);
        }
        break;
      }
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  return result;
}
