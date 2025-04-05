
import fetchAPI from './wordpress-client';
import { toast } from "sonner";

interface LoginResponse {
  login: {
    authToken: string;
    user: {
      id: string;
      name: string;
      email: string;
    }
  }
}

interface RegisterResponse {
  registerUser: {
    user: {
      id: string;
      name: string;
      email: string;
    }
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const query = `
      mutation LoginUser {
        login(input: {
          username: "${username}",
          password: "${password}"
        }) {
          authToken
          user {
            id
            name
            email
          }
        }
      }
    `;
    
    const data = await fetchAPI(query) as LoginResponse;
    
    if (data.login) {
      // Store the token
      localStorage.setItem('wp_token', data.login.authToken);
      localStorage.setItem('wp_user', JSON.stringify(data.login.user));
      
      toast.success("Login successful!");
      return data.login.user;
    }
    
    return null;
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    console.error('Login error:', error);
    return null;
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const query = `
      mutation RegisterUser {
        registerUser(input: {
          username: "${username}",
          email: "${email}",
          password: "${password}"
        }) {
          user {
            id
            name
            email
          }
        }
      }
    `;
    
    const data = await fetchAPI(query) as RegisterResponse;
    
    if (data.registerUser) {
      toast.success("Registration successful! You can now log in.");
      return data.registerUser.user;
    }
    
    return null;
  } catch (error) {
    toast.error("Registration failed. Please try again.");
    console.error('Registration error:', error);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('wp_token');
  localStorage.removeItem('wp_user');
  toast.info("You've been logged out successfully.");
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('wp_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('wp_token');
}

export async function requestPasswordReset(email: string) {
  try {
    const query = `
      mutation SendPasswordResetEmail {
        sendPasswordResetEmail(input: {
          username: "${email}"
        }) {
          success
          message
        }
      }
    `;
    
    const data = await fetchAPI(query);
    toast.success("Password reset link has been sent to your email.");
    return data;
  } catch (error) {
    toast.error("Failed to send password reset email.");
    console.error('Password reset error:', error);
    return null;
  }
}
