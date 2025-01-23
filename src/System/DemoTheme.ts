import { assertNever } from "assert-never";

const STORAGE_KEY = "theme";

function init(): void {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === null) {
    return;
  }
  if (themeCssFiles.find(([name]) => savedTheme === name) === undefined) {
    console.warn("Invalid theme:", savedTheme);
    return;
  }
  applyTheme(savedTheme as DemoTheme);
}

/**
 * Sets the current theme of the page to the given value.
 */
export function setCurrentTheme(theme: DemoTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * The color themes that are available in demo mode (Dark mode / Light mode).
 */
export type DemoTheme = "Light" | "Dark";

/**
 * @returns true if the theme is considered a "dark" theme.
 */
export function isThemeDark(theme: DemoTheme): boolean {
  switch (theme) {
    case "Light":
      return false;
    case "Dark":
      return true;
    default:
      return assertNever(theme);
  }
}

/**
 * @returns the next theme available that can be toggled through.
 */
export function nextTheme(theme: DemoTheme): DemoTheme {
  switch (theme) {
    case "Light":
      return "Dark";
    case "Dark":
      return "Light";
    default:
      return assertNever(theme);
  }
}

/**
 * The HTML "id" attribute of the theme <link> style tag, in the
 * "public/index.html" file.
 */
const themeStyleId = "page-theme";

/**
 * The theme files that are available. The files are located in the "public"
 * directory.
 */
const themeCssFiles: [DemoTheme, string][] = [
  ["Light", "vscode-vars-light.css"],
  ["Dark", "vscode-vars.css"],
];

/**
 * @returns the filename of the given DemoTheme.
 */
function lookupThemeFile(value: DemoTheme): string | null {
  for (const [theme, themeFile] of themeCssFiles) {
    if (theme === value) {
      return themeFile;
    }
  }

  return null;
}

/**
 * @returns the DemoTheme that matches the given theme css filename.
 */
function lookupThemeFromFile(value: string): DemoTheme | null {
  for (const [theme, themeFile] of themeCssFiles) {
    if (themeFile === value) {
      return theme;
    }
  }

  return null;
}

/**
 * An interface for listening to changes to the current page theme.
 */
export interface ThemeChangeListener {
  /**
   * Will be called when the current theme changes (when "setCurrentTheme" is
   * called).
   */
  onThemeChange: (currentTheme: DemoTheme) => void;
}

/**
 * The active ThemeChangeListeners.
 */
const themeChangeListeners = new Set<ThemeChangeListener>();

/**
 * Registers a new ThemeChangeListener, that will be called when the current
 * theme changes (when "setCurrentTheme" is called).
 *
 * You should call "unregisterThemeChangeListener" when the listener is no
 * longer needed.
 */
export function registerThemeChangeListener(
  themeChangeListener: ThemeChangeListener,
): void {
  themeChangeListeners.add(themeChangeListener);
}

/**
 * Unregisters a listener that was previously registered via
 * "registerThemeChangeListener".
 */
export function unregisterThemeChangeListener(
  themeChangeListener: ThemeChangeListener,
): void {
  themeChangeListeners.delete(themeChangeListener);
}

/**
 * @returns the current theme of the page.
 */
export function getCurrentTheme(): DemoTheme {
  const linkTag = document.getElementById(themeStyleId);
  if (linkTag === null) {
    throw new Error(
      `getCurrentTheme: Document element "${themeStyleId}" not found`,
    );
  }

  const hrefValue = linkTag.getAttribute("href");

  if (hrefValue === null) {
    throw new Error(
      `getCurrentTheme: Document element "${themeStyleId}" missing "href" value`,
    );
  }

  const [, fileName] = splitHref(hrefValue);

  const theme = lookupThemeFromFile(fileName);

  if (theme === null) {
    throw new Error(`getCurrentTheme: Unrecognized theme file: "${fileName}"`);
  }

  return theme;
}

function applyTheme(theme: DemoTheme): void {
  const linkTag = document.getElementById(themeStyleId);
  if (linkTag === null) {
    throw new Error(
      `setCurrentTheme: Document element "${themeStyleId}" not found`,
    );
  }

  const hrefValue = linkTag.getAttribute("href");

  if (hrefValue === null) {
    throw new Error(
      `setCurrentTheme: Document element "${themeStyleId}" missing "href" value`,
    );
  }

  const [prefix, fileName] = splitHref(hrefValue);

  const themeFile = lookupThemeFile(theme);

  if (themeFile === null) {
    throw new Error(`setCurrentTheme: Missing file for theme: "${theme}"`);
  }

  if (themeFile === fileName) {
    // The requested theme is already the current theme.
    return;
  }

  linkTag.setAttribute("href", prefix + themeFile);

  // VS Code sets a class on the body tag for webviews to determine if the
  // current theme is light/dark.
  //
  // See:
  // <https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content>
  if (isThemeDark(theme)) {
    document.body.className = "vscode-dark";
  } else {
    document.body.className = "vscode-light";
  }

  themeChangeListeners.forEach((themeChangeListener) => {
    themeChangeListener.onThemeChange(theme);
  });
}

/**
 * @returns a prefix and the filename. The prefix may be empty.
 */
function splitHref(value: string): [string, string] {
  const i = value.lastIndexOf("/");
  if (i < 0) {
    return ["", value];
  }
  return [value.substring(0, i + 1), value.substring(i + 1)];
}

init();
