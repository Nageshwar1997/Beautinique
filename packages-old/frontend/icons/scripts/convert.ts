/**
 * Turns an Iconify icon (its SVG `body`) into the source of one icon component. Only the markup an
 * icon needs is accepted: no scripts, event handlers, outside links, inline styles or text, so an
 * icon copied from anywhere cannot carry code into the apps.
 */

/** One icon as Iconify's JSON API gives it (`https://api.iconify.design/<prefix>.json?icons=<name>`). */
export interface IconifyIcon {
  body: string;
  width?: number;
  height?: number;
}

export interface IconSource {
  /** `solar:sun-2-linear` */
  id: string;
  /** `IconSun` */
  component: string;
  icon: IconifyIcon;
  /** the set's default size when the icon has none of its own (Iconify: 16) */
  setWidth?: number;
  setHeight?: number;
}

// `use` stays allowed: its href may only point inside the icon (checkAttribute)
const REFUSED_TAGS = new Set(['script', 'foreignobject', 'style', 'iframe', 'image', 'a']);
const TOKEN =
  /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[a-zA-Z_:][\w:.-]*\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)|(<)/g;
const ATTRIBUTE = /([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"/g;

/** `stroke-width` → `strokeWidth`, `xlink:href` → `xlinkHref`, `class` → `className`; aria/data stay. */
export function jsxAttributeName(name: string): string {
  if (name === 'class') return 'className';
  if (name.startsWith('aria-') || name.startsWith('data-')) return name;
  return name.replace(/[:-]([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function checkAttribute(tag: string, name: string, value: string): void {
  const lower = name.toLowerCase();
  if (lower.startsWith('on'))
    throw new Error(`<${tag}> has an event handler (${name}); icons cannot run code`);
  if (lower === 'style')
    throw new Error(`<${tag}> has a style attribute; use SVG attributes instead`);
  if ((lower === 'href' || lower === 'xlink:href') && !value.startsWith('#')) {
    throw new Error(`<${tag}> links outside the icon (${name}="${value}")`);
  }
  if (/url\(\s*(?!#)/i.test(value)) throw new Error(`<${tag}> ${name} points outside the icon`);
}

/** The icon's markup as JSX elements (several top-level elements are wrapped in a fragment). */
export function svgBodyToJsx(body: string): string {
  const parts: string[] = [];
  const open: string[] = [];
  let topLevel = 0;
  for (const match of body.matchAll(TOKEN)) {
    const [, closing, tag, attributes = '', selfClosing, text, stray] = match;
    if (stray !== undefined)
      throw new Error(`Cannot read the markup near "${body.slice(match.index, match.index + 20)}"`);
    if (text !== undefined) {
      if (text.trim() !== '') throw new Error(`Icons have no text, found "${text.trim()}"`);
      continue;
    }
    const name = tag ?? '';
    if (REFUSED_TAGS.has(name.toLowerCase()))
      throw new Error(`<${name}> is not allowed in an icon`);
    if (closing) {
      if (open.pop() !== name) throw new Error(`</${name}> closes nothing that is open`);
      parts.push(`</${name}>`);
      continue;
    }
    if (open.length === 0) topLevel += 1;
    const props: string[] = [];
    for (const [, attribute = '', value = ''] of attributes.matchAll(ATTRIBUTE)) {
      checkAttribute(name, attribute, value);
      props.push(`${jsxAttributeName(attribute)}="${value}"`);
    }
    const head = [name, ...props].join(' ');
    if (selfClosing) {
      parts.push(`<${head} />`);
    } else {
      parts.push(`<${head}>`);
      open.push(name);
    }
  }
  if (open.length > 0) throw new Error(`<${open.at(-1) ?? ''}> is never closed`);
  if (topLevel === 0) throw new Error('The icon has no shapes');
  const jsx = parts.join('');
  return topLevel > 1 ? `<>${jsx}</>` : jsx;
}

/** The source of `src/icons/<file>.tsx`: one component made once by createIcon (pure, so unused icons drop out). */
export function iconFile({
  id,
  component,
  icon,
  setWidth = 16,
  setHeight = 16,
}: IconSource): string {
  if (!/^Icon[A-Z][A-Za-z0-9]*$/.test(component)) {
    throw new Error(`Icon components are named Icon<Name>, got "${component}"`);
  }
  if (!/^[a-z0-9-]+:[a-z0-9-]+$/.test(id))
    throw new Error(`"${id}" is not an Iconify id like solar:sun-2-linear`);
  const width = icon.width ?? setWidth;
  const height = icon.height ?? setHeight;
  const viewBox = `0 0 ${String(width)} ${String(height)}`;
  const viewBoxArgument = viewBox === '0 0 24 24' ? '' : `, '${viewBox}'`;
  return `// ${id}: copied from Iconify, see LICENSES.md. Made by scripts/add-icons.ts; do not edit.
import { createIcon } from '../create-icon';

export const ${component} = /* @__PURE__ */ createIcon(
  '${component}',
  ${svgBodyToJsx(icon.body)}${viewBoxArgument},
);
`;
}

/** `IconSunMoon` → `sun-moon` (the file name). */
export const fileNameOf = (component: string): string =>
  component
    .replace(/^Icon/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
