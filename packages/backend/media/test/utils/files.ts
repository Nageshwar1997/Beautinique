import type { FileType } from '../../src/index.ts';

export function bytesOf(text: string): Uint8Array {
  return Uint8Array.from(text, (char) => char.charCodeAt(0));
}

const HEADS: Record<FileType, number[]> = {
  jpeg: [0xff, 0xd8, 0xff, 0xe0],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [...bytesOf('RIFF'), 0, 0, 0, 0, ...bytesOf('WEBPVP8 ')],
  pdf: [...bytesOf('%PDF-1.7\n')],
  mp4: [0, 0, 0, 0x18, ...bytesOf('ftypmp42'), 0, 0, 0, 0],
  mov: [0, 0, 0, 0x14, ...bytesOf('ftypqt  '), 0, 0, 0, 0],
};

/** A made-up file of a type: its real first bytes, then `size` bytes in all. */
export function sampleFile(type: FileType, size = 64): Uint8Array {
  const head = HEADS[type];
  const file = new Uint8Array(Math.max(size, head.length));
  file.set(head);
  return file;
}
