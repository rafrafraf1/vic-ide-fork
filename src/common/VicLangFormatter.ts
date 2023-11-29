export interface FormattingOptions {
  /**
   * Size of a tab in spaces.
   */
  tabSize: number;

  /**
   * Prefer spaces over tabs.
   */
  insertSpaces: boolean;
}

/**
 * Formats a source code line of a Vic Assembly program.
 */
export function formatVicLine(
  line: string,
  options: FormattingOptions,
): string {
  const parts = parseLine(line);
  return formatLineParts(parts, options);
}

interface LineParts {
  /**
   * Whitespace-separated words
   */
  words: string[];

  /**
   * The raw string after the initial "//" prefix
   */
  comment: string | null;
}

function parseLine(line: string): LineParts {
  const [prefix, comment] = extractComment(line);
  const words = prefix.match(/[^\s]+/g);
  return {
    words: words !== null ? words : [],
    comment: comment,
  };
}

function extractComment(line: string): [string, string | null] {
  const commentIndex = line.search("//");

  if (commentIndex < 0) {
    return [line, null];
  }

  const prefix = line.substring(0, commentIndex);
  let comment = line.substring(commentIndex + "//".length);
  comment = comment.trimEnd();
  return [prefix, comment];
}

function formatLineParts(parts: LineParts, options: FormattingOptions): string {
  let result = "";
  if (isInstruction(parts.words)) {
    result += indent(options);
  }

  result += parts.words.join(" ");

  if (parts.comment !== null) {
    if (parts.words.length > 0) {
      result += " ";
    }
    result += "//";
    result += parts.comment;
  }

  return result;
}

function indent(options: FormattingOptions): string {
  if (!options.insertSpaces) {
    return "\t";
  }

  return " ".repeat(options.tabSize);
}

function isInstruction(words: string[]): boolean {
  const lastWord = words[words.length - 1];
  if (lastWord === undefined) {
    return false;
  }

  return !lastWord.endsWith(":");
}
