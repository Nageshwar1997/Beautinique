import {
  type ApiError,
  type CallArgs,
  queryKey,
  type RouteDefinition,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createContext, type ReactNode, use, useRef } from 'react';

import type { ApiClient } from './client';
import { isApiError } from './errors';

const ApiClientContext = createContext<ApiClient | null>(null);

/** The app's client and its TanStack Query cache, for the hooks below. */
export function ApiProvider({
  client,
  queryClient,
  children,
}: {
  client: ApiClient;
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <ApiClientContext value={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiClientContext>
  );
}

/** The client of the nearest ApiProvider. */
export function useApiClient(): ApiClient {
  const client = use(ApiClientContext);
  if (client === null) throw new Error('useApiClient needs an <ApiProvider> above it');
  return client;
}

/**
 * A query cache that does not ask again for what will not change: an answer the server refused
 * (4xx) is final, a lost connection or a server error is tried twice more.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failures, error) =>
          isApiError(error) && error.status >= 400 && error.status < 500 ? false : failures < 2,
      },
    },
  });
}

type RequestOf<Route extends RouteDefinition> = CallArgs<Route>[0];

export type ApiQueryOptions<Route extends RouteDefinition, Data = RouteOutput<Route>> = Omit<
  UseQueryOptions<RouteOutput<Route>, ApiError, Data, ReturnType<typeof queryKey>>,
  'queryKey' | 'queryFn'
>;

/** `(route)` when the route has no input, else `(route, request)`; options last. */
type QueryArgs<Route extends RouteDefinition, Data> =
  undefined extends RequestOf<Route>
    ? [request?: undefined, options?: ApiQueryOptions<Route, Data>]
    : [request: RequestOf<Route>, options?: ApiQueryOptions<Route, Data>];

/** A GET route as a TanStack query, keyed by the contracts' `queryKey`. */
export function useApiQuery<
  const Route extends RouteDefinition & { method: 'GET' },
  Data = RouteOutput<Route>,
>(route: Route, ...[request, options]: QueryArgs<Route, Data>): UseQueryResult<Data, ApiError> {
  const client = useApiClient();
  return useQuery({
    ...options,
    queryKey: queryKey(route, request as { params?: unknown; query?: unknown } | undefined),
    queryFn: ({ signal }) => client.call(route, ...([request, { signal }] as CallArgs<Route>)),
  });
}

/** What `mutate` takes: nothing for a route without input, else its request. */
export type MutationRequest<Route extends RouteDefinition> =
  undefined extends RequestOf<Route>
    ? // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- only void lets `mutate()` go without an argument
      void
    : RequestOf<Route>;

export type ApiMutationOptions<Route extends RouteDefinition, Context = unknown> = Omit<
  UseMutationOptions<RouteOutput<Route>, ApiError, MutationRequest<Route>, Context>,
  'mutationFn'
>;

/**
 * A write as a TanStack mutation. A route that wants an Idempotency-Key gets one per request: the
 * same request sent again before it succeeded (a retry) keeps its key, a changed one or one after
 * a success gets a new key.
 */
export function useApiMutation<const Route extends RouteDefinition, Context = unknown>(
  route: Route,
  options?: ApiMutationOptions<Route, Context>,
): UseMutationResult<RouteOutput<Route>, ApiError, MutationRequest<Route>, Context> {
  const client = useApiClient();
  const pending = useRef<{ request: string; key: string } | null>(null);
  return useMutation({
    ...options,
    mutationFn: async (variables) => {
      let callOptions: { idempotencyKey: string } | undefined;
      if (route.idempotency) {
        const request = JSON.stringify(variables ?? null);
        if (pending.current?.request !== request) {
          pending.current = { request, key: crypto.randomUUID() };
        }
        callOptions = { idempotencyKey: pending.current.key };
      }
      const data = await client.call(
        route,
        ...([variables ?? undefined, callOptions] as CallArgs<Route>),
      );
      // done: the same request asked for again is a new one
      pending.current = null;
      return data;
    },
  });
}
