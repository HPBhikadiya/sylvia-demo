/**
 * Authentication helper function
 * Returns the logged-in user or null
 */
export function getCurrentUser(): { id: string; email: string; role: string } | null {
  // In a real implementation, this would check the session/token
  // and return the authenticated user information
  // For now, we'll return a mock user for demonstration
  return {
    id: 'user-123',
    email: 'admin@carrental.com',
    role: 'admin'
  }
}

/**
 * Permission check function
 * Verifies if the user has permission to perform the action
 */
export function hasPermission(user: { id: string; email: string; role: string } | null): boolean {
  if (!user) return false
  
  // In a real implementation, this would check specific permissions
  // For now, we'll allow admin users to perform all actions
  return user.role === 'admin'
}
