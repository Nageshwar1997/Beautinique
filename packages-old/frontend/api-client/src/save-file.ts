import type { DownloadedFile } from '@beautinique/shared-contracts';

/** How long the file's object URL stays: the browser has started saving it long before. */
export const SAVE_URL_LIFETIME_MS = 60_000;

/**
 * Saves a downloaded file (`client.download`) the way a link with `download` does: the browser's
 * own save, with the server's file name. The object URL goes again a minute later.
 */
export function saveFile({ blob, fileName }: DownloadedFile, doc: Document = document): void {
  const url = URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.hidden = true;
  doc.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, SAVE_URL_LIFETIME_MS);
}
