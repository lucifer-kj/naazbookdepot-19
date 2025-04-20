
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string or Date object
 * @param formatStr - Date format string (default: MM/dd/yyyy)
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date, formatStr = 'MM/dd/yyyy'): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
