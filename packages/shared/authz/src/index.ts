export { type ChainOf, type GrantProblem, grantProblems, scopeWithin } from './delegation';
export {
  can,
  type CheckOptions,
  decide,
  type Decision,
  type DecisionReason,
  type Grant,
  isGrantActive,
  isStepUpFresh,
  type PermissionLookup,
  reachesAnything,
  type ResourceScope,
  type Scope,
  scopeCovers,
  type ScopeSpec,
  scopeSpec,
} from './matcher';
export { checkSeparation, type EarlierStep, type SeparationDecision } from './separation';
