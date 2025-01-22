import "./CodeEditor.css";

import * as React from "react";

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  defaultHighlightStyle,
  indentOnInput,
  indentUnit,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { linter, lintGutter } from "@codemirror/lint";
import {
  Compartment,
  EditorState,
  Transaction,
  type Extension,
} from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  type ViewUpdate,
} from "@codemirror/view";
import { assertNever } from "assert-never";
import { flushSync } from "react-dom";

import { nonNull } from "../../Functional/Nullability";
import {
  getCurrentTheme,
  registerThemeChangeListener,
  unregisterThemeChangeListener,
  type DemoTheme,
  type ThemeChangeListener,
} from "../../System/DemoTheme";
import { vicAsmStreamParser } from "./VicAsmStreamParser";
import { vicAsmLintSource, vicBinLintSource } from "./VicLintSource";

export interface CodeEditorHandle {
  /**
   * Briefly flashes the background of the assembly code editor with the
   * specified background color.
   *
   * This can be used to indicate to the user that something happened.
   */
  pulseAsmEditor: (pulseColor: PulseColor) => void;

  /**
   * Briefly flashes the background of the binary code editor with the specified
   * background color.
   *
   * This can be used to indicate to the user that something happened.
   */
  pulseBinEditor: (pulseColor: PulseColor) => void;
}

export type PulseColor = "SUCCESS" | "ERROR";

export interface CodeEditorProps {
  asmValue: string;
  binValue: string;
  asmBinSynced: boolean;
  onAsmValueChange?: (asmValue: string) => void;
  onBinValueChange?: (binValue: string) => void;
}

// Trimmed version of the codemirror default "basicSetup":
// <https://github.com/codemirror/basic-setup/blob/86f3699347713440e5b1a50b6a98d82963335d50/src/codemirror.ts#L50>
function baseSetup(): Extension {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    highlightActiveLine(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  ];
}

const LINT_DELAY = 400;

const cmAsmExtensions: Extension = [
  baseSetup(),
  indentUnit.of("    "),
  StreamLanguage.define(vicAsmStreamParser),
  linter(vicAsmLintSource, {
    delay: LINT_DELAY,
  }),
  lintGutter(),
];

const cmBinExtensions: Extension = [
  baseSetup(),
  linter(vicBinLintSource, {
    delay: LINT_DELAY,
  }),
  lintGutter(),
];

export const CodeEditor = React.memo(
  React.forwardRef(
    (
      props: CodeEditorProps,
      ref: React.ForwardedRef<CodeEditorHandle>,
    ): React.JSX.Element => {
      const {
        asmValue,
        binValue,
        asmBinSynced,
        onAsmValueChange,
        onBinValueChange,
      } = props;

      const asmValueRef = React.useRef<string>(asmValue);
      const binValueRef = React.useRef<string>(binValue);

      const asmEditorDiv = React.useRef<HTMLDivElement>(null);
      const binEditorDiv = React.useRef<HTMLDivElement>(null);

      const editorTheme = React.useRef<Compartment>(new Compartment());
      const asmEditorView = React.useRef<EditorView | null>(null);
      const binEditorView = React.useRef<EditorView | null>(null);

      const asmBinSyncedRef = React.useRef<boolean>(asmBinSynced);

      React.useImperativeHandle(
        ref,
        (): CodeEditorHandle => ({
          pulseAsmEditor: (pulseColor: PulseColor): void => {
            if (asmEditorDiv.current !== null) {
              pulseEditor(asmEditorDiv.current, pulseColor);
            }
          },
          pulseBinEditor: (pulseColor: PulseColor): void => {
            if (binEditorDiv.current !== null) {
              pulseEditor(binEditorDiv.current, pulseColor);
            }
          },
        }),
        [],
      );

      React.useEffect(() => {
        const themeChangeListener: ThemeChangeListener = {
          onThemeChange: (currentTheme: DemoTheme) => {
            if (asmEditorView.current !== null) {
              reconfigureTheme(
                editorTheme.current,
                asmEditorView.current,
                currentTheme,
              );
            }
            if (binEditorView.current !== null) {
              reconfigureTheme(
                editorTheme.current,
                binEditorView.current,
                currentTheme,
              );
            }
          },
        };

        registerThemeChangeListener(themeChangeListener);

        return (): void => {
          unregisterThemeChangeListener(themeChangeListener);
        };
      }, []);

      React.useEffect(() => {
        const asmEditorUpdateListener = (update: ViewUpdate): void => {
          if (update.docChanged) {
            const text = asmView.state.doc.toString();
            asmValueRef.current = text;
            if (isUserEvent(update) && onAsmValueChange !== undefined) {
              // This flushSync is needed because otherwise React will batch
              // events (keypresses) that happen in quick succession. This can
              // cause changes to get lost because older changes might
              // overwrite newer ones.
              //
              // See: <https://react.dev/reference/react-dom/flushSync>
              flushSync(() => {
                onAsmValueChange(text);
              });
            }
          }

          if (isUserEvent(update) && asmBinSyncedRef.current) {
            const lineNumber = getUpdateCursorLineNumber(update);
            moveEditorViewCursor(binView, lineNumber);
          }
        };

        const binEditorUpdateListener = (update: ViewUpdate): void => {
          if (update.docChanged) {
            const text = binView.state.doc.toString();
            binValueRef.current = text;
            if (isUserEvent(update) && onBinValueChange !== undefined) {
              // This flushSync is needed because otherwise React will batch
              // events (keypresses) that happen in quick succession. This can
              // cause changes to get lost because older changes might
              // overwrite newer ones.
              //
              // See: <https://react.dev/reference/react-dom/flushSync>
              flushSync(() => {
                onBinValueChange(text);
              });
            }
          }

          if (isUserEvent(update) && asmBinSyncedRef.current) {
            const lineNumber = getUpdateCursorLineNumber(update);
            moveEditorViewCursor(asmView, lineNumber);
          }
        };

        const asmEditorScrollListener = (): void => {
          if (
            asmBinSyncedRef.current &&
            asmEditorDiv.current !== null &&
            binEditorDiv.current !== null
          ) {
            matchEditorScrollTo(asmEditorDiv.current, binEditorDiv.current);
          }
        };

        const binEditorScrollListener = (): void => {
          if (
            asmBinSyncedRef.current &&
            asmEditorDiv.current !== null &&
            binEditorDiv.current !== null
          ) {
            matchEditorScrollTo(binEditorDiv.current, asmEditorDiv.current);
          }
        };

        const asmView = new EditorView({
          state: EditorState.create({
            doc: asmValueRef.current,
            extensions: [
              cmAsmExtensions,
              editorTheme.current.of(themeExtension(getCurrentTheme())),
              EditorView.updateListener.of(asmEditorUpdateListener),
              EditorView.domEventHandlers({ scroll: asmEditorScrollListener }),
            ],
          }),
          parent: nonNull(asmEditorDiv.current),
        });

        const binView = new EditorView({
          state: EditorState.create({
            doc: binValueRef.current,
            extensions: [
              cmBinExtensions,
              editorTheme.current.of(themeExtension(getCurrentTheme())),
              EditorView.updateListener.of(binEditorUpdateListener),
              EditorView.domEventHandlers({ scroll: binEditorScrollListener }),
            ],
          }),
          parent: nonNull(binEditorDiv.current),
        });

        asmEditorView.current = asmView;
        binEditorView.current = binView;

        return (): void => {
          asmView.destroy();
          binView.destroy();
        };
      }, [onAsmValueChange, onBinValueChange]);

      React.useEffect(() => {
        if (
          asmEditorView.current !== null &&
          asmValue !== asmValueRef.current
        ) {
          asmValueRef.current = asmValue;
          setEditorViewContents(asmEditorView.current, asmValue);
        }
        if (
          binEditorView.current !== null &&
          binValue !== binValueRef.current
        ) {
          binValueRef.current = binValue;
          setEditorViewContents(binEditorView.current, binValue);
        }

        asmBinSyncedRef.current = asmBinSynced;

        if (
          asmBinSynced &&
          asmEditorDiv.current !== null &&
          binEditorDiv.current !== null &&
          asmEditorView.current !== null &&
          binEditorView.current !== null
        ) {
          const lineNumber = getEditorViewCursorLineNumber(
            asmEditorView.current,
          );
          moveEditorViewCursor(binEditorView.current, lineNumber);
          matchEditorScrollTo(asmEditorDiv.current, binEditorDiv.current);
        }
      }, [asmBinSynced, asmValue, binValue]);

      return (
        <div className="CodeEditor-Root">
          <div className="CodeEditor-AsmEditor" ref={asmEditorDiv} />
          <div className="CodeEditor-BinEditor" ref={binEditorDiv} />
        </div>
      );
    },
  ),
);

function reconfigureTheme(
  editorTheme: Compartment,
  editorView: EditorView,
  currentTheme: DemoTheme,
): void {
  editorView.dispatch({
    effects: editorTheme.reconfigure(themeExtension(currentTheme)),
  });
}

function themeExtension(currentTheme: DemoTheme): Extension[] | Extension {
  switch (currentTheme) {
    case "Dark":
      return oneDark;
    case "Light":
      // Empty will use the default codemirror theme
      return [];
    default:
      return assertNever(currentTheme);
  }
}

function setEditorViewContents(editorView: EditorView, contents: string): void {
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: contents,
    },
  });
}

function isUserEvent(update: ViewUpdate): boolean {
  return update.transactions.every(
    (tx: Transaction): boolean =>
      tx.annotation(Transaction.userEvent) !== undefined,
  );
}

function getUpdateCursorLineNumber(update: ViewUpdate): number {
  const selectionRange = update.view.state.selection.ranges[0];
  if (selectionRange === undefined) {
    return 1;
  }
  const line = update.state.doc.lineAt(selectionRange.head);
  return line.number;
}

function getEditorViewCursorLineNumber(view: EditorView): number {
  const selectionRange = view.state.selection.ranges[0];
  if (selectionRange === undefined) {
    return 1;
  }
  const line = view.state.doc.lineAt(selectionRange.head);
  return line.number;
}

function moveEditorViewCursor(
  editorView: EditorView,
  targetLine: number,
): void {
  const line = editorView.state.doc.line(targetLine);
  editorView.dispatch({
    selection: { anchor: line.from, head: line.from },
  });
}

const allPulseClassNames: string[] = [
  "CodeEditor-Pulse-Success",
  "CodeEditor-Pulse-Error",
];

function pulseColorCssClass(pulseColor: PulseColor): string {
  switch (pulseColor) {
    case "SUCCESS":
      return "CodeEditor-Pulse-Success";
    case "ERROR":
      return "CodeEditor-Pulse-Error";
    default:
      return assertNever(pulseColor);
  }
}

function matchEditorScrollTo(
  sourceEditorViewParent: HTMLElement,
  targetEditorViewParent: HTMLElement,
): void {
  const srcScroller = sourceEditorViewParent.querySelector(".cm-scroller");
  if (srcScroller === null) {
    return;
  }
  const targetScroller = targetEditorViewParent.querySelector(".cm-scroller");
  if (targetScroller === null) {
    return;
  }
  targetScroller.scrollTop = srcScroller.scrollTop;
}

function pulseEditor(
  editorViewParent: HTMLElement,
  pulseColor: PulseColor,
): void {
  const scroller = editorViewParent.querySelector(".cm-scroller");
  if (scroller === null) {
    return;
  }
  pulseCssClass(scroller, allPulseClassNames, pulseColorCssClass(pulseColor));
}

function pulseCssClass(
  elem: Element,
  clearClassNames: string[],
  className: string,
): void {
  // <https://stackoverflow.com/questions/44145740/how-does-double-requestanimationframe-work>
  // <https://stackoverflow.com/questions/60559227/requestanimationframe-appears-to-be-invalid>
  // <https://stackoverflow.com/questions/55134528/css-transition-doesnt-start-callback-isnt-called>

  elem.classList.remove(...clearClassNames);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elem.classList.add(className);
    });
  });
}
