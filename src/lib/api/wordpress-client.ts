
import { toast } from "sonner";

// WordPress GraphQL API endpoint
const API_URL = "https://your-wordpress-site.com/graphql";

// Helper function for GraphQL requests
async function fetchAPI(query: string, variables = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = localStorage.getItem('wp_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();
    
    if (json.errors) {
      console.error('WordPress GraphQL Error:', json.errors);
      throw new Error('Failed to fetch API');
    }
    
    return json.data;
  } catch (error) {
    console.error('Error fetching from WordPress:', error);
    toast.error("Failed to connect to the server. Please try again later.");
    throw error;
  }
}

export default fetchAPI;
