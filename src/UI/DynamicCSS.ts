/**
 * A tool for creating new dynamic CSS at runtime.
 *
 * The callback can define the CSS for new CSS classes (and keyframes).
 *
 * After the function returns, all of the styles will be added to the
 * document.
 *
 * When the styles are no longer needed, you can call `dispose` on the
 * returned `RegisteredDynCSS` instance.
 */
export function withDynamicCSS(
  callback: (dyn: DynamicCSS) => void,
): RegisteredDynCSS {
  let cssContents = "";

  callback({
    class: (css: CSS): string => {
      const [name, contents] = cssClass(css);
      cssContents += contents;
      return name;
    },
    keyframes: (css: CSS): string => {
      const [name, contents] = cssKeyframes(css);
      cssContents += contents;
      return name;
    },
  });

  const styles = addStylesToDocument(cssContents);

  return {
    dispose: (): void => {
      deleteStyles(styles);
    },
  };
}

export interface DynamicCSS {
  /**
   * Creates a new CSS class.
   *
   * The argument should be wrapped with the `css` template tag.
   *
   * @returns the name of the newly created CSS class. This can be assigned to
   * an element's `className` field.
   */
  class: (css: CSS) => string;
  /**
   * Creates a new CSS class animation.
   *
   * The argument should be wrapped with the `css` template tag.
   *
   * @returns the name of the newly created CSS keyframes rule. This can be
   * used later in a CSS `animation` declaration.
   */
  keyframes: (css: CSS) => string;
}

export interface RegisteredDynCSS {
  /**
   * Deletes all of the styles that were added. This should be called when the
   * styles are no longer being used.
   */
  dispose: () => void;
}

/**
 * Generates a CSS rule with a uniquely generated class name.
 */
function cssClass(css: CSS): [string, string] {
  const name = `dyn_${uniqueRandomString()}`;
  const decl = `.${name} {\n${css.contents}\n}\n\n`;
  return [name, decl];
}

/**
 * Generates a CSS keyframes with a uniquely generated keyframes name.
 */
function cssKeyframes(keyframes: CSS): [string, string] {
  const name = `dyn_${uniqueRandomString()}`;
  const decl = `@keyframes ${name} {\n${keyframes.contents}\n}\n\n`;
  return [name, decl];
}

export interface CSS {
  tag: "CSS";
  contents: string;
}

/**
 * Template tag for authoring embedded CSS.
 */
export function css(
  strings: TemplateStringsArray,
  ...args: (string | number)[]
): CSS {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i]; // eslint-disable-line @typescript-eslint/restrict-plus-operands
    if (args.length - 1 >= i) {
      result += args[i]; // eslint-disable-line @typescript-eslint/restrict-plus-operands
    }
  }
  return {
    tag: "CSS",
    contents: result.trim(),
  };
}

/**
 * Adds a CSS `<style>` tag to the document head containing the supplied
 * contents.
 */
function addStylesToDocument(cssContents: string): HTMLStyleElement {
  const style = document.createElement("style");
  const nonce = getNonce();
  if (nonce !== null) {
    style.setAttribute("nonce", nonce);
  }
  style.appendChild(document.createTextNode(cssContents));
  document.head.appendChild(style);
  return style;
}

/**
 * Deletes the CSS `<style>` tag from the document head.
 */
function deleteStyles(style: HTMLStyleElement): void {
  document.head.removeChild(style);
}

/**
 * Creates a cryptographically random string that can be assumed to be unique.
 */
function uniqueRandomString(): string {
  const len = 40;
  const arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
}

/**
 * Dynamic `<style>` tags require access to the CSP nonce. We use an existing
 * convention established by webpack of storing the nonce in the following
 * global variable.
 *
 * See:
 *
 * <https://webpack.js.org/guides/csp/>
 * <https://github.com/webpack/webpack/pull/3210/files>
 * <https://github.com/styled-components/styled-components/issues/887>
 * <https://github.com/styled-components/styled-components/pull/1022/files>
 */
function getNonce(): string | null {
  interface WindowNonce {
    __webpack_nonce__?: string;
  }

  const nonce = (window as unknown as WindowNonce).__webpack_nonce__;
  if (nonce === undefined) {
    return null;
  }
  return nonce;
}
