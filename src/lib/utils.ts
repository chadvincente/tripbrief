/**
 * Converts a 2-letter ISO country code to a flag emoji
 * @param countryCode - The ISO 3166-1 alpha-2 country code (e.g., "US", "FR", "JP")
 * @returns The corresponding flag emoji
 */
export function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍' // Default to globe emoji if invalid
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

/**
 * Converts a string to title case
 * @param str - The string to convert
 * @returns The title-cased string
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
