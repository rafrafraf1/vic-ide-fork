import type { Diagnostic } from "@codemirror/lint";
import type { Text } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { assertNever } from "assert-never";

import type { SrcError } from "../../common/SrcError";
import { parseVicBin } from "../../common/VicBinParser";
import { compileVicProgram } from "../../common/VicLangFullCompiler";

export function vicAsmLintSource(view: EditorView): Diagnostic[] {
  const errors = getAsmEditorErrors(view);

  const text = view.state.doc;
  return errors.map((e) => convertSrcError(text, e));
}

function getAsmEditorErrors(view: EditorView): SrcError[] {
  const source = view.state.doc.toString();
  const result = compileVicProgram(source);

  switch (result.program.kind) {
    case "Ok":
      return [];
    case "Error":
      return result.program.error;
    default:
      assertNever(result.program);
  }
}

export function vicBinLintSource(view: EditorView): Diagnostic[] {
  const errors = getBinEditorErrors(view);

  const text = view.state.doc;
  return errors.map((e) => convertSrcError(text, e));
}

function getBinEditorErrors(view: EditorView): SrcError[] {
  const source = view.state.doc.toString();
  const result = parseVicBin(source);

  switch (result.kind) {
    case "Ok":
      return [];
    case "Error":
      return result.error;
    default:
      assertNever(result);
  }
}

function convertSrcError(text: Text, srcError: SrcError): Diagnostic {
  const line = text.line(srcError.srcLoc.line + 1);
  return {
    severity: "error",
    message: srcError.message,
    from: line.from + srcError.srcLoc.startCol,
    to: line.from + srcError.srcLoc.endCol,
  };
}
