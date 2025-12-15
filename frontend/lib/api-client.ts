import { getSession, signOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type FetchOptions = RequestInit & {
  token?: string;
};

/**
 * Wrapper around fetch that automatically adds the Authorization header
 * from the NextAuth session if available.
 * Handles 401 redirects and JSON parsing safely.
 */
export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...customConfig } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(customConfig.headers || {}),
  };

  // 1. Token Attachment Strategy
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    // Client-side: Attempt to get session token if not explicitly provided
    try {
      const session = await getSession();
      if (session?.accessToken) {
        (headers as any)['Authorization'] = `Bearer ${session.accessToken}`;
      }
    } catch (e) {
      // Allow request to proceed (might be a public endpoint or session fetch failed)
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 2. Global Error Handling
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      // CRITICAL: Use signOut to clear the NextAuth session cookie.
      // This prevents middleware from redirecting back to dashboard, breaking the infinite loop.
      signOut({ callbackUrl: '/login' });
    }
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     const errorMessage = errorData.message || response.statusText || 'Network request failed';
     throw new Error(errorMessage);
  }

  // 3. Handle 204 No Content (Common for DELETE/PATCH)
  if (response.status === 204) {
      return {} as T;
  }

  return response.json();
}