/**
 * Utility functions for order-related operations
 */

const statusColorMap = new Map([
  ['pending', 'yellow'],
  ['confirmed', 'blue'],
  ['preparing', 'orange'],
  ['ready', 'purple'],
  ['delivered', 'green'],
  ['cancelled', 'red']
]);

/**
 * Get the color scheme for an order status badge
 * @param status - The order status
 * @returns The color scheme for the status badge
 */
export const getStatusColor = (status: string): string => {
  return statusColorMap.get(status) || 'gray';
};

/**
 * Format a date string for display in order components
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string, 
  options?: {
    dateStyle?: 'short' | 'medium' | 'long';
    includeTime?: boolean;
  }
): string => {
  const { dateStyle = 'medium', includeTime = true } = options || {};
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    day: 'numeric',
  };

  // Set month format based on dateStyle
  if (dateStyle === 'short') {
    formatOptions.month = 'short';
  } else if (dateStyle === 'long') {
    formatOptions.month = 'long';
  } else {
    formatOptions.month = 'short'; // default medium
  }

  // Add time if requested
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return new Date(dateString).toLocaleDateString('en-US', formatOptions);
};
