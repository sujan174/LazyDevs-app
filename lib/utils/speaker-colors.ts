/**
 * Utility for managing speaker colors in meetings
 */

export interface SpeakerColor {
  border: string;
  bg: string;
  text: string;
}

const SPEAKER_COLORS: SpeakerColor[] = [
  { border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-800 dark:text-blue-200" },
  { border: "border-green-500", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-800 dark:text-green-200" },
  { border: "border-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-800 dark:text-yellow-200" },
  { border: "border-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-800 dark:text-purple-200" },
  { border: "border-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-800 dark:text-pink-200" },
  { border: "border-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-800 dark:text-teal-200" },
  { border: "border-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-800 dark:text-orange-200" },
  { border: "border-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-800 dark:text-cyan-200" },
];

/**
 * Get speaker color classes
 * Uses a stable hash to ensure the same speaker always gets the same color
 */
export function getSpeakerColor(speaker: string): SpeakerColor {
  // Simple hash function to get consistent colors for speakers
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = ((hash << 5) - hash) + speaker.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % SPEAKER_COLORS.length;
  return SPEAKER_COLORS[index];
}

/**
 * Get action badge configuration
 */
export function getActionBadge(action: string) {
  const badges = {
    create: {
      bg: "bg-green-100 dark:bg-green-950/30",
      text: "text-green-800 dark:text-green-200",
      label: "Create Task",
      icon: "➕",
    },
    update: {
      bg: "bg-blue-100 dark:bg-blue-950/30",
      text: "text-blue-800 dark:text-blue-200",
      label: "Update Task",
      icon: "✏️",
    },
    comment: {
      bg: "bg-yellow-100 dark:bg-yellow-950/30",
      text: "text-yellow-800 dark:text-yellow-200",
      label: "Add Comment",
      icon: "💬",
    },
    close: {
      bg: "bg-gray-100 dark:bg-gray-950/30",
      text: "text-gray-800 dark:text-gray-200",
      label: "Close Task",
      icon: "✓",
    },
    flag: {
      bg: "bg-red-100 dark:bg-red-950/30",
      text: "text-red-800 dark:text-red-200",
      label: "Flag Issue",
      icon: "🚩",
    },
    meta: {
      bg: "bg-purple-100 dark:bg-purple-950/30",
      text: "text-purple-800 dark:text-purple-200",
      label: "Meta Info",
      icon: "ℹ️",
    },
  };

  return (
    badges[action as keyof typeof badges] || {
      bg: "bg-gray-100 dark:bg-gray-950/30",
      text: "text-gray-800 dark:text-gray-200",
      label: action,
      icon: "•",
    }
  );
}
