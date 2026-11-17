/** Something a person already did on the same item, e.g. `{ by: 'U1', as: 'maker' }`. */
export interface EarlierStep {
  /** The person's id, as stored. The system is not a person: leave its steps out. */
  by: string;
  /** What they did, for the audit log (`maker`, `rejecter`, `listing owner`). */
  as: string;
}

export interface SeparationDecision {
  allowed: boolean;
  reason: 'allowed' | 'same-person';
  /** The earlier step the person also did. */
  conflictsWith?: string;
}

/**
 * Separation of duties (ARCHITECTURE §7.3): the person acting must not be anyone who did a
 * conflicting step on the same item: the checker is not the maker, the one who decides an appeal
 * is not the one who rejected it, QC is not by the listing's owner. Ids are compared exactly, so
 * pass them as stored. A missing person is a bug, not a pass, so it throws.
 */
export function checkSeparation(
  actorId: string,
  earlier: readonly EarlierStep[],
): SeparationDecision {
  if (actorId.trim() === '') {
    throw new Error('Separation of duties needs the id of the person acting');
  }
  for (const step of earlier) {
    if (step.by.trim() === '') {
      throw new Error(
        `Earlier step "${step.as}" has no person: leave it out when the system did it`,
      );
    }
  }
  const clash = earlier.find((step) => step.by === actorId);
  return clash
    ? { allowed: false, reason: 'same-person', conflictsWith: clash.as }
    : { allowed: true, reason: 'allowed' };
}
