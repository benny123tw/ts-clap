/**
 * Calculates the Levenshtein distance between two strings.
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one string into the other.
 *
 * @param str1 - The first string.
 * @param str2 - The second string.
 * @returns The Levenshtein distance between the two strings.
 */
export function levenshteinDistance(str1: string, str2: string) {
  const m = str1.length
  const n = str2.length

  // Create a 2D array to store the distances
  const dp = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0))

  // Initialize the first row and column
  for (let i = 0; i <= m; i++)
    dp[i][0] = i

  for (let j = 0; j <= n; j++)
    dp[0][j] = j

  // Calculate the distance
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + substitutionCost, // substitution
      )
    }
  }

  return dp[m][n]
}
