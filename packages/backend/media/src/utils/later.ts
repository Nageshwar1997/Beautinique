/**
 * Runs `work` and gives its result as a promise, a thrown error as a rejected one: what an async
 * port returns, for an in-memory fake that has nothing to wait for.
 */
export function later<T>(work: () => T): Promise<T> {
  return new Promise<T>((resolve) => {
    resolve(work());
  });
}
