
/**
 * Checks if an error is a database connection error.
 * Handles nested causes and various error codes/messages.
 */
export function isConnectionError(error: any): boolean {
  if (!error) return false

  // Check top-level code and message
  if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) return true
  if (error.message?.includes('connection') || error.message?.includes('Connection')) return true

  // Check nested cause (common in Drizzle/Postgres drivers)
  if (error.cause) {
    if (error.cause.code === 'ECONNREFUSED') return true
    if (error.cause.message?.includes('ECONNREFUSED')) return true
    if (error.cause.message?.includes('connection') || error.cause.message?.includes('Connection')) return true
  }

  // Check for specific "Failed query" message which usually wraps the underlying error
  if (error.message?.startsWith('Failed query') && error.cause) {
    return isConnectionError(error.cause)
  }

  return false
}
