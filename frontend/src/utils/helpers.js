/**
 * Format a date string for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date/time string for display
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a time string for display
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format distance in meters
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Copy text to clipboard with toast feedback
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

/**
 * Generate CSV from data array
 */
export const generateCSV = (headers, rows, filename = 'report.csv') => {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const str = String(cell ?? '');
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get time remaining until a date as formatted string
 */
export const getTimeRemaining = (expiresAt) => {
  const total = new Date(expiresAt) - Date.now();
  if (total <= 0) return { total: 0, minutes: 0, seconds: 0, display: '00:00' };

  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return {
    total,
    minutes,
    seconds,
    display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Calculate attendance percentage
 */
export const calcPercentage = (present, total) => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};
