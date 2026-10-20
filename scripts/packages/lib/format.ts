import { format, getFileInfo, resolveConfig } from 'prettier';

/**
 * Formats a file's text with the repo's Prettier config, so generated files pass `npm run format:check`.
 * Files Prettier has no parser for (LICENSE) stay as they are.
 */
export async function formatFile(filepath: string, content: string): Promise<string> {
  const { inferredParser } = await getFileInfo(filepath);
  if (inferredParser === null) {
    return content;
  }
  const options = await resolveConfig(filepath, { editorconfig: true });
  return format(content, { ...options, filepath });
}
