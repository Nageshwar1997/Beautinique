export {
  API_BASE_URL,
  type ApiClient,
  type ApiClientOptions,
  createApiClient,
  OTHER_TAB_REFRESH_WAIT_MS,
  type SessionChange,
  type StepUpHandler,
} from './client';
export { errorMessage, isApiError } from './errors';
export {
  type ApiMutationOptions,
  ApiProvider,
  type ApiQueryOptions,
  createQueryClient,
  type MutationRequest,
  useApiClient,
  useApiMutation,
  useApiQuery,
} from './query';
export { ApiError, queryKey, queryKeyPrefix } from '@beautinique/shared-contracts';
