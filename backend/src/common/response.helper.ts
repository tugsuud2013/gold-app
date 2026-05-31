export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode?: string;
}

export function successResponse<T>(
  message: string,
  data: T | null = null,
): ApiResponse<T> {
  return { success: true, message, data };
}

export function errorResponse(
  message: string,
  errorCode?: string,
  data: null = null,
): ApiResponse<null> {
  return { success: false, message, data, errorCode };
}
