// `npm run docs:check`: every relative link in the docs points at something in the repository, and
// every `npm run` command in the README and CLAUDE.md is a root script (D-019).
import { ROOT } from '../src/constants/paths.ts';
import {
  COMMAND_DOCS,
  docFiles,
  docsCommandProblems,
  docsPathProblems,
} from '../src/docs-paths.ts';

const problems = [...docsPathProblems(ROOT), ...docsCommandProblems(ROOT)];
if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${String(problems.length)} problem(s) in the docs.`);
  process.exit(1);
}
console.log(
  `Docs checked: links in ${String(docFiles(ROOT).length)} files and the commands in ` +
    `${COMMAND_DOCS.join(' and ')}, no problem.`,
);
