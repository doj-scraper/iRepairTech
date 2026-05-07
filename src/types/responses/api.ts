/**
 * API Response Types
 * Standard success/error envelope for all API routes
 */

export type ApiSuccess<T> = { data: T };
export type ApiError = { error: string; details?: Record<string, string[]> };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return 'error' in res;
}
