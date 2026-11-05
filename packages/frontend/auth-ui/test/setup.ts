import { configure } from '@testing-library/react';

// `findBy*` and `waitFor` give up after 1 s by default. A test's first call in a fresh worker runs
// cold code (axios, the contracts' schemas, React Aria) before it reaches the fake identity: about
// 0.1–0.4 s on an idle laptop, over 1 s when every worker is busy (CI, the full `npm test`). Nothing
// is wrong then and the tests never depend on the time, so give them room (as the hooks package does).
configure({ asyncUtilTimeout: 10_000 });
