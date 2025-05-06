import { fetchStrapi } from '../strapi-client';
import { toast } from 'sonner';

export interface StrapiMedia {
  id: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// Upload a file to Strapi
export async function uploadFile(file: File): Promise<StrapiMedia> {
  const formData = new FormData();
  formData.append('files', file);
  
  const token = localStorage.getItem('strapi_jwt');
  const apiUrl = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api';
  
  try {
    const response = await fetch(`${apiUrl.replace('/api', '')}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    
    // Strapi returns an array even for single uploads
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error('File upload error:', error);
    toast.error(`Upload failed: ${error.message}`);
    throw error;
  }
}

// Get media details by ID
export async function getMediaById(id: string): Promise<StrapiMedia> {
  try {
    const endpoint = `/upload/files/${id}`;
    return fetchStrapi<StrapiMedia>(endpoint);
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

// Get absolute URL for media
export function getMediaUrl(media?: { url?: string } | null): string {
  if (!media || !media.url) return '';
  
  const url = media.url;
  
  // If it's already an absolute URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, prefix with API URL
  const apiUrl = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  return `${baseUrl}${url}`;
}
