// An editor on Windows may put a byte order mark at the start of a file; it is not part of the first key.
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
