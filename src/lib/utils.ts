import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export const getStatusBadgeVariant = (status: string | null): BadgeVariant => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'on_hold':
      return 'warning';
    case 'processing':
      return 'secondary';
    case 'shipped':
      return 'default';
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const formatCurrency = (amount: number | null | undefined, currency: string = 'INR') => {
  if (amount === null || amount === undefined) return 'N/A';

  const formatter = new Intl.NumberFormat('en-IN', { // Using 'en-IN' for Indian Rupee formatting
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};
