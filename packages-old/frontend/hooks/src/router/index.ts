// `@beautinique/frontend-hooks/router`: the hooks that need a React Router (v8) router. Apart from
// the root entry so an app without a router never loads one.
export type { ParamsInput, ParamsUpdate, StringRecord } from './query-string';
export { usePathParams } from './use-path-params';
export { useQueryParamInput, type UseQueryParamInputOptions } from './use-query-param-input';
export { type QueryParamsUpdateOptions, useQueryParams } from './use-query-params';
