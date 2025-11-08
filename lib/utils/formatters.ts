/**
 * Utility functions for formatting data
 */

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "1h 30min" or "45min")
 */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0min";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes}min`;
}

/**
 * Format timestamp in milliseconds to MM:SS format
 * @param ms - Timestamp in milliseconds
 * @returns Formatted timestamp (e.g., "1:23" or "12:05")
 */
export function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Get Date object from various timestamp formats
 * @param timestamp - Firestore timestamp or other format
 * @returns Date object or null if invalid
 */
export function getDateFromTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;

  try {
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000);
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
  } catch (error) {
    console.error("Error parsing timestamp:", error);
  }

  return null;
}
