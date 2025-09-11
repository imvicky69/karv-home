/**
 * Generates the initials from a user's display name.
 * e.g., "Vicky Raja" -> "VR"
 * e.g., "Admin" -> "A"
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'; // 'U' for Unknown/User

  const nameParts = name.trim().split(' ');
  if (nameParts.length > 1) {
    // Return the first letter of the first two name parts
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  } else {
    // Return the first letter of the single name part
    return nameParts[0][0].toUpperCase();
  }
};