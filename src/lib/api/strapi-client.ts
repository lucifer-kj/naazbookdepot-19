
import { toast } from "sonner";

// Replace with your actual Strapi endpoint
const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL || "http://localhost:1337/api";

interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: any;
}

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  };
  error?: StrapiError;
}

// Helper function to handle Strapi API responses
export const normalizeStrapi = <T>(response: any): T => {
  // Handle single item response
  if (response.data && !Array.isArray(response.data)) {
    const { id, attributes } = response.data;
    return { id, ...attributes } as T;
  }
  
  // Handle collection response
  if (response.data && Array.isArray(response.data)) {
    return response.data.map(item => ({ 
      id: item.id, 
      ...item.attributes 
    })) as T;
  }
  
  // Fallback
  return response as T;
};

// Main fetch function for Strapi
export async function fetchStrapi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('strapi_jwt');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${STRAPI_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log(`Fetching from Strapi: ${url}`);
    
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    
    if (!res.ok) {
      const error = data.error || { 
        status: res.status,
        name: 'FetchError', 
        message: 'Failed to fetch data from Strapi'
      };
      
      console.error('Strapi API Error:', error);
      throw error;
    }
    
    return normalizeStrapi<T>(data);
  } catch (error: any) {
    console.error('Error fetching from Strapi:', error);
    
    // User-friendly error message
    const errorMessage = error.message || 'Failed to connect to server';
    toast.error(errorMessage);
    
    throw error;
  }
}

// Authentication helpers
export async function strapiLogin(identifier: string, password: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw data.error || { message: 'Login failed' };
    }

    // Store the JWT
    localStorage.setItem('strapi_jwt', data.jwt);
    localStorage.setItem('strapi_user', JSON.stringify(data.user));
    
    return {
      jwt: data.jwt,
      user: data.user
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Login failed';
    toast.error(errorMessage);
    throw error;
  }
}

export async function strapiRegister(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${STRAPI_API_URL}/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw data.error || { message: 'Registration failed' };
    }

    return {
      jwt: data.jwt,
      user: data.user
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Registration failed';
    toast.error(errorMessage);
    throw error;
  }
}

export function strapiLogout() {
  localStorage.removeItem('strapi_jwt');
  localStorage.removeItem('strapi_user');
}

export function getCurrentStrapiUser() {
  const userStr = localStorage.getItem('strapi_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isStrapiAuthenticated() {
  return !!localStorage.getItem('strapi_jwt');
}
