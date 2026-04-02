/**
 * Text Highlighter Utility
 * Highlights search terms in text
 */

export interface HighlightMatch {
  text: string
  isHighlight: boolean
}

/**
 * Highlights search query in text
 * @param text - Text to search in
 * @param query - Search query
 * @returns Array of text segments with highlight flags
 */
export function highlightText(text: string, query: string): HighlightMatch[] {
  if (!query || !text) {
    return [{ text, isHighlight: false }]
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)

  return parts
    .filter(part => part)
    .map((part) => ({
      text: part,
      isHighlight: regex.test(part)
    }))
}

/**
 * Extracts a snippet around the search query
 * @param text - Full text
 * @param query - Search query
 * @param maxLength - Maximum snippet length
 * @returns Snippet with context around the query
 */
export function extractSnippet(
  text: string,
  query: string,
  maxLength: number = 150
): string {
  if (!query || !text) {
    return text.substring(0, maxLength)
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const queryIndex = lowerText.indexOf(lowerQuery)

  if (queryIndex === -1) {
    return text.substring(0, maxLength)
  }

  // Calculate snippet boundaries
  const contextBefore = Math.floor((maxLength - query.length) / 2)
  const contextAfter = Math.ceil((maxLength - query.length) / 2)

  let start = Math.max(0, queryIndex - contextBefore)
  let end = Math.min(text.length, queryIndex + query.length + contextAfter)

  // Adjust to word boundaries
  if (start > 0) {
    const spaceIndex = text.lastIndexOf(' ', start)
    if (spaceIndex !== -1 && spaceIndex > start - 20) {
      start = spaceIndex + 1
    }
  }

  if (end < text.length) {
    const spaceIndex = text.indexOf(' ', end)
    if (spaceIndex !== -1 && spaceIndex < end + 20) {
      end = spaceIndex
    }
  }

  let snippet = text.substring(start, end)

  // Add ellipsis
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

/**
 * Calculate relevance score (0-100)
 * Based on query occurrence and position
 */
export function calculateRelevance(text: string, query: string): number {
  if (!query || !text) return 0

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  let score = 0

  // Exact match bonus
  if (lowerText === lowerQuery) score += 50

  // Title/start position bonus
  if (lowerText.startsWith(lowerQuery)) score += 30
  else if (lowerText.includes(lowerQuery)) score += 15

  // Word match bonus
  const textWords = lowerText.split(/\s+/)
  const queryWords = lowerQuery.split(/\s+/)
  const matchingWords = queryWords.filter(qw => 
    textWords.some(tw => tw.includes(qw))
  ).length
  score += (matchingWords / queryWords.length) * 20

  return Math.min(100, score)
}
