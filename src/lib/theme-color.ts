/**
 * `<meta name="theme-color">` is rendered into the document head, where CSS
 * custom properties are not available — so this one value must stay a literal.
 *
 * Keep it in sync with `--ink-950` in src/app/globals.css, which is the only
 * other place a hex colour is allowed to live.
 */
export const THEME_COLOR = "#08090b";
