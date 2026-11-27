import { describe, expect, it } from 'vitest';

import { detectFileType, FILE_TYPES, IMAGE_TYPES } from '../src/index.ts';
import { bytesOf, sampleFile } from './utils/files.ts';

describe('detectFileType', () => {
  it('SR-061: tells JPEG, PNG, WebP, PDF, MP4 and MOV (an iPhone video, D-471) from their bytes', () => {
    for (const type of ['jpeg', 'png', 'webp', 'pdf', 'mp4', 'mov'] as const) {
      expect(detectFileType(sampleFile(type))).toBe(type);
    }
  });

  it('SR-061: SVG, HTML (a ".png" name changes nothing) and anything else are no type', () => {
    expect(detectFileType(bytesOf('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectFileType(bytesOf('<!doctype html><script>alert(1)</script>'))).toBeNull();
    expect(detectFileType(bytesOf('GIF89a....'))).toBeNull();
    // A RIFF file that is not WebP (a WAV sound), and an ISO file of a brand that is not MP4.
    expect(detectFileType(bytesOf('RIFF\u0000\u0000\u0000\u0000WAVEfmt '))).toBeNull();
    expect(detectFileType(bytesOf('\u0000\u0000\u0000\u0018ftypheic\u0000\u0000'))).toBeNull();
  });

  it('a file too short for any signature is no type', () => {
    expect(detectFileType(new Uint8Array())).toBeNull();
    expect(detectFileType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(detectFileType(bytesOf('%PDF'))).toBeNull();
    expect(detectFileType(bytesOf('RIFF1234WEB'))).toBeNull();
  });

  it('every type has its content type and the family of its size limit; images are three', () => {
    expect(FILE_TYPES.pdf).toEqual({ contentType: 'application/pdf', family: 'pdf' });
    expect(FILE_TYPES.mp4.family).toBe('video');
    expect(FILE_TYPES.mov).toEqual({ contentType: 'video/quicktime', family: 'video' });
    expect(IMAGE_TYPES).toEqual(['jpeg', 'png', 'webp']);
    expect(IMAGE_TYPES.every((type) => FILE_TYPES[type].family === 'image')).toBe(true);
  });
});
