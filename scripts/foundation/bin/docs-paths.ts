// `npm run docs:check`: every relative link in the docs points at something in the repository (D-019).
import { ROOT } from '../src/constants/paths.ts';
import { docFiles, docsPathProblems } from '../src/docs-paths.ts';

const problems = docsPathProblems(ROOT);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${String(problems.length)} broken link(s) in the docs.`);
  process.exit(1);
}
console.log(`Docs links checked: ${String(docFiles(ROOT).length)} files, no broken link.`);
