
import { strapiLogin, strapiRegister, strapiLogout, getCurrentStrapiUser, isStrapiAuthenticated } from '../strapi-client';
import { toast } from 'sonner';

export async function loginUser(email: string, password: string) {
  try {
    const { user } = await strapiLogin(email, password);
    toast.success('Login successful!');
    return user;
  } catch (error: any) {
    toast.error('Login failed. Please check your credentials.');
    console.error('Login error:', error);
    return null;
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const { user } = await strapiRegister(username, email, password);
    toast.success('Registration successful! You can now log in.');
    return user;
  } catch (error: any) {
    toast.error('Registration failed. Please try again.');
    console.error('Registration error:', error);
    return null;
  }
}

export function logoutUser() {
  strapiLogout();
  toast.info("You've been logged out successfully.");
}

export function getCurrentUser() {
  return getCurrentStrapiUser();
}

export function isAuthenticated() {
  return isStrapiAuthenticated();
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api'}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw data.error || { message: 'Password reset request failed' };
    }
    
    toast.success('Password reset link has been sent to your email.');
    return data;
  } catch (error: any) {
    toast.error('Failed to send password reset email.');
    console.error('Password reset error:', error);
    return null;
  }
}

// Function to reset password with code
export async function resetPassword(code: string, password: string, passwordConfirmation: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api'}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw data.error || { message: 'Password reset failed' };
    }
    
    toast.success('Password has been reset successfully. You can now log in.');
    return { success: true };
  } catch (error: any) {
    toast.error('Failed to reset password. Please try again.');
    console.error('Password reset error:', error);
    return { success: false, error };
  }
}

// Check if user has a certain role
export function userHasRole(role: string) {
  const user = getCurrentStrapiUser();
  if (!user || !user.roles) return false;
  
  return user.roles.some((r: any) => r.name === role);
}

// Check if user is admin
export function isAdmin() {
  return userHasRole('Admin');
}
