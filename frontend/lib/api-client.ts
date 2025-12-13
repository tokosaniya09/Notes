import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

type FetchOptions = RequestInit & {
  token?: string;
};

/**
 * Wrapper around fetch that automatically adds the Authorization header
 * from the NextAuth session if available.
 */
export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...customConfig } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(customConfig.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  } else {
    // Client-side: try to get session token
    // Note: getSession() works in Client Components. 
    // For Server Components, pass the token explicitly.
    try {
      const session = await getSession();
      // @ts-ignore
      if (session?.accessToken) {
         // @ts-ignore
        (headers as any)['Authorization'] = `Bearer ${session.accessToken}`;
      }
    } catch (e) {
      // Ignore session errors if running in contexts where getSession might fail 
      // or if we simply want to attempt a public request.
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     const errorMessage = errorData.message || response.statusText || 'Network request failed';
     throw new Error(errorMessage);
  }

  return response.json();
}
