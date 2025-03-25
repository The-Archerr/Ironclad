import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get base API URL based on environment (web vs Android)
const getBaseApiUrl = () => {
  // Running on Android emulator - use 10.0.2.2 to access host machine
  if (window.location.protocol === 'capacitor:') {
    return 'http://10.0.2.2:5000';
  }
  
  // Running in browser - use relative URL
  return '';
};

// Function to build full URL
const buildUrl = (endpoint: string): string => {
  const baseUrl = getBaseApiUrl();
  // Ensure endpoint starts with /
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${formattedEndpoint}`;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Construct full URL including base URL if needed
  const fullUrl = buildUrl(url);
  
  console.log(`Making ${method} request to: ${fullUrl}`);
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construct full URL including base URL if needed
    const endpoint = queryKey[0] as string;
    const fullUrl = buildUrl(endpoint);
    
    console.log(`Making query to: ${fullUrl}`);
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
